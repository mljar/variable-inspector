// tests/utils/notebook.ts
import { expect, Page } from '@playwright/test';

/**
 * Create a new notebook from the MLJAR launcher.
 * Keeps existing console logs and robustness around focusing the active notebook.
 */
export async function createNewNotebook(page: Page): Promise<void> {
  let mljarCount = await page.locator('.mljar-launcher-controls').count();
  console.log(`🎛️ Found ${mljarCount} MLJAR control elements`);

  if (mljarCount === 0) {
    console.log('🔄 No MLJAR controls found, trying to open launcher...');
    try {
      const shortcut = process.platform === 'darwin' ? 'Meta+Shift+L' : 'Control+Shift+L';
      await page.keyboard.press(shortcut);
      await page.waitForSelector('.mljar-launcher-controls', { timeout: 5_000 });
      mljarCount = await page.locator('.mljar-launcher-controls').count();
      console.log(`🎛️ After launcher trigger: ${mljarCount} MLJAR elements`);
    } catch {
      console.log('⌛ Launcher shortcut did not reveal MLJAR controls');
    }
  }

  expect(mljarCount, 'MLJAR controls should be present').toBeGreaterThan(0);

  const button = page
    .locator('.mljar-launcher-controls')
    .getByText('New Notebook', { exact: true })
    .first();

  if (await button.isVisible().catch(() => false)) {
    console.log('✅ New Notebook button is visible');
    await button.click();

    // Let JL do its thing
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });

    // Prefer an active (non-hidden) NotebookPanel
    let activeNotebook = page.locator('.jp-NotebookPanel:not(.lm-mod-hidden)').first();

    // Try to wait for a visible notebook panel
    try {
      await activeNotebook.waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      // If none visible, try to activate a likely notebook tab, then re-wait
      const ipynbTab = page
        .locator('.lm-TabBar-tabLabel', { hasText: /\.ipynb$/ })
        .first();
      if (await ipynbTab.count()) {
        await ipynbTab.click();
        activeNotebook = page.locator('.jp-NotebookPanel:not(.lm-mod-hidden)').first();
        await activeNotebook.waitFor({ state: 'visible', timeout: 10_000 });
      } else {
        // Fallback: click any current tab first, then wait again
        const currentTab = page.locator('.lm-TabBar-tab.jp-mod-current, .lm-TabBar-tab.lm-mod-current').first();
        if (await currentTab.count()) {
          await currentTab.click();
          await activeNotebook.waitFor({ state: 'visible', timeout: 10_000 });
        } else {
          throw new Error('No visible NotebookPanel and no .ipynb tab to activate');
        }
      }
    }

    console.log('✅ Active notebook is visible');
    console.log('✅ Notebook opened');
  } else {
    console.log('❌ New Notebook button not visible');
    throw new Error('New Notebook button not visible');
  }
}

/**
 * Write code into the first cell and run it with the toolbar button.
 * Keeps existing console logs.
 */
export async function writeCodeInFirstCell(page: Page, code: string): Promise<void> {
  const cellEditor = page.locator('.jp-Notebook .jp-Cell .jp-InputArea-editor').first();
  await cellEditor.click();

  await page.keyboard.type(code);
  console.log('✍️ Wrote code into cell');

  const runButton = page
    .getByRole('button', { name: /Run this cell and advance \(Shift\+Enter\)/ })
    .first();

  await runButton.waitFor({ state: 'visible', timeout: 5_000 });
  await runButton.click();
  console.log('▶️ Executed cell by clicking the run button');
}
