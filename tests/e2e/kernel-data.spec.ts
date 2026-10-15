import { test, expect, Page } from '@playwright/test';

async function setup(page: Page) {
  await page.goto('/lab?token=kernel-data-fixture');
  await page.waitForFunction(() => Boolean((window as any).jupyterapp));
  await page.evaluate(async () => {
    const app = (window as any).jupyterapp;
    await Promise.race([
      app.restored,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('App restore timed out')), 20000)
      )
    ]);
    const ids = [
      '@mljar/kernel-data:plugin',
      'variable-inspector:plugin',
      'jupyter-package-manager:plugin',
      'mljar-piece-of-code'
    ];
    for (const id of ids) {
      await app.activatePlugin(id);
    }
    // Inspect the actual registry to verify separately bundled extensions use one token.
    const plugins = app.pluginRegistry?._plugins || app._pluginMap;
    const plugin = (id: string) =>
      plugins instanceof Map ? plugins.get(id) : plugins[id];
    const provider = plugin('@mljar/kernel-data:plugin');
    for (const id of ids.slice(1)) {
      if (!plugin(id).requires.includes(provider.provides)) {
        throw new Error(`${id} has a different kernel-data token`);
      }
    }
    const ai = Array.from(app.listPlugins()).filter((id: any) =>
      id.includes('ai-data-scientist')
    ) as string[];
    const aiConsumers = ai.filter(id =>
      plugin(id)?.requires.includes(provider.provides)
    );
    if (aiConsumers.length < 2) {
      throw new Error(
        'AI sidebar and conversation plugin must use the shared token'
      );
    }
    for (const id of aiConsumers) {
      await app.activatePlugin(id);
    }
    (window as any).__kernelDataTest = {
      app,
      data: provider.service,
      panels: {}
    };
  });
}
async function notebook(page: Page, key: string) {
  console.log('Opening notebook', key);
  await page.evaluate(async key => {
    const test = (window as any).__kernelDataTest;
    const model = await test.app.commands.execute('docmanager:new-untitled', {
      type: 'notebook'
    });
    const panel = await test.app.commands.execute('docmanager:open', {
      path: model.path,
      factory: 'Notebook'
    });
    test.panels[key] = panel;
    await panel.context.ready;
    panel.context.sessionContext.kernelPreference = {
      name: 'python3',
      shouldStart: true,
      canStart: true,
      autoStartDefault: true
    };
    await panel.context.sessionContext.initialize();
    if (!panel.context.sessionContext.session?.kernel) {
      await panel.context.sessionContext.changeKernel({ name: 'python3' });
    }
    await panel.context.sessionContext.ready;
    test.app.shell.activateById(panel.id);
  }, key);
}
async function activate(page: Page, key: string) {
  await page.evaluate(key => {
    const { app, panels } = (window as any).__kernelDataTest;
    app.shell.activateById(panels[key].id);
  }, key);
  await expect
    .poll(() =>
      page.evaluate(key => {
        const { app, panels } = (window as any).__kernelDataTest;
        return app.shell.currentWidget === panels[key];
      }, key)
    )
    .toBe(true);
}
async function run(page: Page, key: string, code: string) {
  await activate(page, key);
  await page.evaluate(
    async ({ key, code }) => {
      const { app, panels } = (window as any).__kernelDataTest;
      const panel = panels[key];
      app.shell.activateById(panel.id);
      panel.content.activeCellIndex = 0;
      panel.content.activeCell.model.sharedModel.setSource(code);
      await app.commands.execute('notebook:run-cell');
    },
    { key, code }
  );
}
async function snapshot(page: Page, key: string, kind = 'variables') {
  return page.evaluate(
    ({ key, kind }) => {
      const { panels, data } = (window as any).__kernelDataTest;
      return data[kind](panels[key].context.sessionContext.session?.kernel?.id);
    },
    { key, kind }
  );
}

test('real extensions share live kernel data, isolate notebooks, and keep workspace clean', async ({
  page,
  request
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page);
  console.log('Shared token and activation verified');
  await notebook(page, 'a');
  console.log('Notebook A ready');
  await run(
    page,
    'a',
    'import pandas as pd\nruntime_only_a = pd.DataFrame({"a": [1, 2]})'
  );
  await expect
    .poll(async () =>
      (await snapshot(page, 'a')).items.map((item: any) => item.varName)
    )
    .toContain('runtime_only_a');
  await expect
    .poll(async () => (await snapshot(page, 'a', 'packages')).status)
    .toBe('loaded');
  expect(
    (await snapshot(page, 'a', 'packages')).items.some(
      (pkg: any) => pkg.name === 'pandas'
    )
  ).toBe(true);
  await page.getByRole('tab', { name: 'Your Variables', exact: true }).click();
  await expect(
    page
      .locator('.mljar-variable-inspector-item')
      .filter({ hasText: 'runtime_only_a' })
  ).toBeVisible();

  await notebook(page, 'b');
  console.log('Notebook B ready');
  await run(page, 'b', 'runtime_only_b = 42');
  await expect
    .poll(async () =>
      (await snapshot(page, 'b')).items.map((item: any) => item.varName)
    )
    .toContain('runtime_only_b');
  expect(
    (await snapshot(page, 'b')).items.some(
      (item: any) => item.varName === 'runtime_only_a'
    )
  ).toBe(false);
  await expect(
    page
      .locator('.mljar-variable-inspector-item')
      .filter({ hasText: 'runtime_only_a' })
  ).toHaveCount(0);

  await run(page, 'a', 'del runtime_only_a\nreplacement = 99');
  await expect
    .poll(async () =>
      (await snapshot(page, 'a')).items.map((item: any) => item.varName)
    )
    .toContain('replacement');
  expect(
    (await snapshot(page, 'a')).items.some(
      (item: any) => item.varName === 'runtime_only_a'
    )
  ).toBe(false);

  // Add distribution metadata only to B's temporary import path, without installing into a user environment.
  await run(
    page,
    'b',
    [
      'import pathlib as _pathlib, sys as _sys',
      '_root = _pathlib.Path.cwd() / "fixture-distribution"',
      '_dist = _root / "kernel_data_fixture-1.0.dist-info"',
      '_dist.mkdir(parents=True, exist_ok=True)',
      '_dist.joinpath("METADATA").write_text("Metadata-Version: 2.1\\nName: kernel-data-fixture\\nVersion: 1.0\\n")',
      '_sys.path.insert(0, str(_root))'
    ].join('\n')
  );
  // The package command must use the current notebook, not the first closure.
  await page.evaluate(async () => {
    const { app, panels, data } = (window as any).__kernelDataTest;
    app.shell.activateById(panels.b.id);
    data.invalidate(panels.b.context.sessionContext.session.kernel.id);
  });
  await activate(page, 'b');
  await page.evaluate(() =>
    (window as any).__kernelDataTest.app.commands.execute(
      'mljar-packages-manager-refresh'
    )
  );
  await expect
    .poll(async () => (await snapshot(page, 'b', 'packages')).status)
    .toBe('loaded');

  expect(
    (await snapshot(page, 'b', 'packages')).items.some(
      (pkg: any) => pkg.name === 'kernel-data-fixture'
    )
  ).toBe(true);
  expect(
    (await snapshot(page, 'a', 'packages')).items.some(
      (pkg: any) => pkg.name === 'kernel-data-fixture'
    )
  ).toBe(false);

  // Same kernel ID on restart must not preserve the previous namespace.
  await page.evaluate(async () => {
    const { panels } = (window as any).__kernelDataTest;
    await panels.b.context.sessionContext.session.kernel.restart();
  });
  await expect
    .poll(async () =>
      (await snapshot(page, 'b')).items.some(
        (item: any) => item.varName === 'runtime_only_b'
      )
    )
    .toBe(false);
  await run(page, 'b', 'after_restart = 7');
  await expect
    .poll(async () =>
      (await snapshot(page, 'b')).items.map((item: any) => item.varName)
    )
    .toContain('after_restart');

  const workspaceId = await page.evaluate(
    () =>
      JSON.parse(document.getElementById('jupyter-config-data')!.textContent!)
        .workspace
  );
  const workspaceUrl = `/lab/api/workspaces/${encodeURIComponent(
    workspaceId
  )}?token=kernel-data-fixture`;
  // Wait until the workspace autosave includes the open notebooks, then check the API payload.
  await expect
    .poll(async () => {
      const response = await request.get(workspaceUrl);
      if (!response.ok()) {
        return false;
      }
      const workspace = await response.json();
      return Boolean(workspace.data?.['layout-restorer:data']);
    })
    .toBe(true);
  const workspace = await (await request.get(workspaceUrl)).json();
  for (const key of [
    'mljarVariables',
    'mljarVariablesStatus',
    'mljarPackages',
    'mljarPackagesStatus',
    'mljarPackagesPanelId'
  ]) {
    expect(workspace.data).not.toHaveProperty(key);
  }
  expect(workspace.data['kernel-data-fixture:keep']).toEqual({
    preserved: true
  });
  expect(JSON.stringify(workspace)).not.toContain('legacy_fixture_value');
  expect(JSON.stringify(workspace)).not.toContain('runtime_only_a');
  expect(JSON.stringify(workspace)).not.toContain('after_restart');
  expect(
    errors.filter(error =>
      /kernel-data|No provider|already registered/i.test(error)
    )
  ).toEqual([]);
});

test('Piece of Code selects live DataFrames and executes a recipe', async ({
  page
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await setup(page);
  await notebook(page, 'recipe');
  console.log('Recipe notebook ready');
  await run(
    page,
    'recipe',
    'import pandas as pd\nsales = pd.DataFrame({"country": ["Poland", "France", "Germany"], "revenue": [120, 180, 150]})'
  );
  console.log('Recipe DataFrame created');

  await page.getByRole('tab', { name: 'Piece of Code', exact: true }).click();
  await page
    .getByRole('button', { name: 'Data wrangling', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Display DataFrame', exact: true })
    .click();
  const dataFrame = page.getByRole('combobox', {
    name: 'Select input for DataFrame to display',
    exact: true
  });
  await expect(dataFrame).toHaveValue('sales');

  // A newly created variable must reach an already-open recipe without reopening it.
  await run(page, 'recipe', 'sales_eu = sales.iloc[:2].copy()');
  await expect(dataFrame.locator('option')).toHaveText(['sales', 'sales_eu']);
  await dataFrame.selectOption('sales_eu');
  await expect(dataFrame).toHaveValue('sales_eu');
  await page.evaluate(() =>
    (window as any).__kernelDataTest.app.commands.execute(
      'notebook:insert-cell-below'
    )
  );
  await page
    .getByRole('button', { name: 'Insert & Execute', exact: true })
    .click();

  const result = page.getByRole('table').last();
  await expect(result).toContainText('Poland');
  await expect(result).toContainText('France');
  await expect(result).not.toContainText('Germany');
  await expect
    .poll(() =>
      page.evaluate(() => {
        const { panels } = (window as any).__kernelDataTest;
        return Array.from(panels.recipe.content.model.cells).some((cell: any) =>
          cell.sharedModel.getSource().includes('sales_eu.head(n=5)')
        );
      })
    )
    .toBe(true);

  // Deleting the selected DataFrame removes it from the recipe's live options.
  await run(page, 'recipe', 'del sales_eu');
  await expect(dataFrame.locator('option')).toHaveText(['sales']);
  await expect(dataFrame).toHaveValue('sales');
  expect(errors).toEqual([]);
});
