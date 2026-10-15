import { test, expect } from '@playwright/test';

test('package manager, recipes and AI activate without Variables Explorer', async ({
  page
}) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/lab?token=kernel-data-fixture');
  await page.waitForFunction(() => Boolean((window as any).jupyterapp));
  await page.evaluate(async () => {
    const app = (window as any).jupyterapp;
    await app.restored;
    const ids = Array.from(app.listPlugins()) as string[];
    if (
      ids.includes('variable-inspector:kernel-data') ||
      ids.includes('@mljar/kernel-data:plugin')
    ) {
      throw new Error('The optional-dependency test must not load a provider');
    }
    const registry = app.pluginRegistry?._plugins || app._pluginMap;
    const plugin = (id: string) =>
      registry instanceof Map ? registry.get(id) : registry[id];
    const consumers = [
      'jupyter-package-manager:plugin',
      'mljar-piece-of-code',
      ...ids.filter(
        id =>
          id.includes('ai-data-scientist') &&
          plugin(id)?.optional?.some(
            (token: any) => token.name === '@mljar/kernel-data:IKernelData'
          )
      )
    ];
    if (consumers.length < 4)
      throw new Error('Both AI consumers must request kernel data optionally');
    for (const id of consumers) {
      await app.activatePlugin(id);
      const token = plugin(id).optional.find(
        (token: any) => token.name === '@mljar/kernel-data:IKernelData'
      );
      if (!token || (await app.resolveOptionalService(token)) !== null) {
        throw new Error(`${id} did not receive a missing optional service`);
      }
      if (!app.isPluginActivated(id))
        throw new Error(`${id} failed to activate`);
    }
    const model = await app.commands.execute('docmanager:new-untitled', {
      type: 'notebook'
    });
    const panel = await app.commands.execute('docmanager:open', {
      path: model.path,
      factory: 'Notebook'
    });
    await panel.context.ready;
    panel.sessionContext.kernelPreference = {
      name: 'python3',
      shouldStart: true,
      canStart: true,
      autoStartDefault: true
    };
    await panel.sessionContext.initialize();
    if (!panel.sessionContext.session?.kernel)
      await panel.sessionContext.changeKernel({ name: 'python3' });
    await panel.sessionContext.ready;
    app.shell.activateById(panel.id);
    (window as any).__optionalPanel = panel;
  });
  await expect(
    page.getByRole('tab', { name: 'Your Variables', exact: true })
  ).toHaveCount(0);
  await page.getByRole('tab', { name: 'Package Manager', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Uninstall ipykernel', exact: true })
  ).toBeVisible();
  await page.evaluate(async () => {
    const app = (window as any).jupyterapp;
    await app.commands.execute('mljar-package-manager:install', {
      package: 'pandas'
    });
  });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  await page.getByRole('tab', { name: 'Piece of Code', exact: true }).click();
  await page
    .getByRole('button', { name: 'Data wrangling', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Display DataFrame', exact: true })
    .click();
  await expect(
    page.getByText('There are no DataFrames in your notebook.', {
      exact: false
    })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Install package', exact: true })).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Back to cookbook', exact: true })
    .click();
  await page.evaluate(async () => {
    const panel = (window as any).__optionalPanel;
    await panel.sessionContext.session.kernel.restart();
  });
  await page.getByRole('tab', { name: 'Package Manager', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Uninstall ipykernel', exact: true })
  ).toBeVisible();
  expect(errors).toEqual([]);
});
