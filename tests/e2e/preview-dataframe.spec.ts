// tests/preview-dataframe.spec.ts
import { test, expect } from '@playwright/test';
import { createNewNotebook, writeCodeInFirstCell } from '../utils/notebook';

test.setTimeout(30_000);
test.slow();

test('Preview DataFrame', async ({ page }) => {
  console.log('🔍 Starting minimal MLJAR test...');

  const url = 'http://localhost:8899/lab';
  try {
    console.log(`🌐 Navigating to ${url} ...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5_000 });
    console.log('Started MLJAR ...');
  } catch (err) {
    console.error('❌ Failed to navigate to JupyterLab:', err);
    throw err;
  }

  await page.waitForSelector('[role="main"]', { timeout: 5_000 });
  console.log('✅ JupyterLab loaded');

  // ⛏️ Refactored helpers
  await createNewNotebook(page);
  await writeCodeInFirstCell(
    page,
    ['import pandas as pd', 'df = pd.DataFrame({"a":[1,2,3]})'].join('\n')
  );
  console.log('✍️ Wrote pandas DataFrame code into cell');

  // 👇 Open the "Your Variables" tab in the left sidebar (unchanged)
  const variablesTab = page
    .locator(
      'li[role="tab"][data-id="mljar-variable-inspector::mljar-left-sidebar"]'
    )
    .first();

  try {
    await variablesTab.waitFor({ state: 'attached', timeout: 10_000 });
    console.log('🧭 Found Variables tab handle');

    const a11yTab = page.getByRole('tab', { name: 'Your Variables' }).first();
    const targetTab = (await a11yTab.count()) ? a11yTab : variablesTab;

    await targetTab.click();
    await expect(targetTab).toHaveAttribute('aria-selected', 'true');
    console.log('✅ Clicked "Your Variables" tab');

    const variableItems = page.locator('li.mljar-variable-inspector-item');

    await expect(variableItems).toHaveCount(1);
    console.log('✅ Exactly one variable item found in inspector');

    const showButton = variableItems
      .locator('button.mljar-variable-inspector-show-variable-button')
      .first();
    await showButton.waitFor({ state: 'visible', timeout: 5_000 });
    await showButton.click();
    console.log('✅ Clicked Show Value button for df');

    const dfTab = page
      .locator('.lm-TabBar-tabLabel', { hasText: 'DataFrame df' })
      .first();
    await dfTab.waitFor({ state: 'visible', timeout: 10_000 });
    console.log('✅ "DataFrame df" tab is visible');

    const paginationInfo = page
      .locator('.mljar-variable-inspector-pagination-container')
      .first();

    await expect(paginationInfo).toBeVisible({ timeout: 5_000 });
    console.log('✅ Pagination info is visible');

    await expect(paginationInfo).toContainText('Rows: 3');
    await expect(paginationInfo).toContainText('Columns: 1');
    console.log('✅ Pagination info shows "Rows: 3 Columns: 1"');

    const nextCellEditor = page
      .locator(
        '.jp-NotebookPanel:not(.lm-mod-hidden) .jp-Cell .jp-InputArea-editor'
      )
      .nth(1);
    await nextCellEditor.click();
    await page.keyboard.type('df["b"] = [4, 5, 6]\ndf.loc[3] = [7, 8]');

    const runButton = page
      .getByRole('button', {
        name: /Run this cell and advance \(Shift\+Enter\)/
      })
      .first();
    await runButton.click();

    await expect(paginationInfo).toContainText('Rows: 4');
    await expect(paginationInfo).toContainText('Columns: 2');
    console.log('✅ Open DataFrame preview refreshed after code execution');
  } catch (e) {
    console.warn('⚠️ Could not activate "Your Variables" tab:', e);
    throw e;
  }
});
