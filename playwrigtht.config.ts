import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 90_000,
  use: {
    baseURL: 'http://localhost:8899',   // 👈 port 8899
    headless: false,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never' }]],
});
