import { expect, test as setup } from '@playwright/test'

// Log in once per app and reuse the session (localStorage for Vue, cookie for Nuxt).
setup('authenticate', async ({ page }, testInfo) => {
  const app = testInfo.project.name.replace('-setup', '')

  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@example.com')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/products/)
  await page.context().storageState({ path: `.auth/${app}.json` })
})
