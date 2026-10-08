import { expect, test } from '@playwright/test'

test.describe('authentication', () => {
  // Start signed out; these tests manage their own sessions.
  test.use({ storageState: { cookies: [], origins: [] } })

  test('redirects guests to login, then back to the requested page', async ({ page }) => {
    await page.goto('/categories')
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcategories|\/login\?redirect=\/categories/)

    await page.getByLabel('Email').fill('demo@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page).toHaveURL(/\/categories$/)
    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible()
  })

  test('shows an error for wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@example.com')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('These credentials do not match our records.')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('logs out and protects pages afterwards', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/products/)

    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/login/)

    await page.goto('/products')
    await expect(page).toHaveURL(/\/login/)
  })
})
