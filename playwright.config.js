import process from 'node:process'
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1024 } } },
    { name: 'mobile', use: { viewport: { width: 402, height: 874 } } },
    { name: 'narrow', use: { viewport: { width: 320, height: 740 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: false,
    timeout: 30000,
  },
})
