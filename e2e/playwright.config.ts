import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

/**
 * Runs the same suite against both frontends. Every run boots an isolated stack
 * (own ports, fresh SQLite DB) so it never touches the dev servers or dev data.
 */
const API = 'http://127.0.0.1:8001'
const VUE = 'http://localhost:5174'
const NUXT = 'http://localhost:3001'

const root = fileURLToPath(new URL('..', import.meta.url))
const db = `${root}crud/database/e2e.sqlite`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'vue-setup', testMatch: /auth\.setup\.ts/, use: { baseURL: VUE } },
    {
      name: 'vue',
      dependencies: ['vue-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: VUE, storageState: '.auth/vue.json' },
    },
    { name: 'nuxt-setup', testMatch: /auth\.setup\.ts/, use: { baseURL: NUXT } },
    {
      name: 'nuxt',
      dependencies: ['nuxt-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: NUXT, storageState: '.auth/nuxt.json' },
    },
  ],

  webServer: [
    {
      name: 'api',
      cwd: `${root}crud`,
      // Plain `php -S` (not `artisan serve`) so the env vars below reach the app.
      command: `rm -f ${db} && touch ${db} && php artisan migrate:fresh --seed --force && php -S 127.0.0.1:8001 -t public public/index.php`,
      url: `${API}/up`,
      env: {
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: db,
        CACHE_STORE: 'array', // no persisted login rate-limit between test logins
        CORS_ALLOWED_ORIGINS: `${VUE},${NUXT}`,
      },
      reuseExistingServer: false,
      stderr: 'ignore', // php -S logs every request to stderr
      timeout: 60_000,
    },
    {
      name: 'vue',
      cwd: `${root}vue3`,
      command: 'npx vite --port 5174 --strictPort',
      url: VUE,
      env: { VITE_API_URL: `${API}/api` },
      reuseExistingServer: false,
    },
    {
      name: 'nuxt',
      cwd: `${root}nuxt3`,
      command: 'E2E_BUILD=1 npx nuxi build && node .output-e2e/server/index.mjs',
      url: NUXT,
      env: { PORT: '3001', NUXT_PUBLIC_API_BASE: `${API}/api` },
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
})
