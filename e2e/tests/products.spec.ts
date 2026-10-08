import { expect, test, type Page } from '@playwright/test'

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()

async function createProduct(page: Page, name: string, sku: string) {
  await page.goto('/products')
  await page.getByRole('link', { name: '+ New product' }).click()
  await expect(page.getByRole('heading', { name: 'New product' })).toBeVisible()

  await page.getByLabel('Name').fill(name)
  await page.getByLabel('SKU').fill(sku)
  await page.getByLabel('Price (USD)').fill('49.50')
  await page.getByLabel('Stock').fill('12')
  await page.getByLabel('Description').fill('Created by Playwright')
  await page.getByRole('button', { name: 'Create product' }).click()

  await expect(page).toHaveURL(/\/products(\?.*)?$/)
}

async function search(page: Page, term: string) {
  await page.getByLabel('Search products').fill(term)
  await expect(page).toHaveURL(new RegExp(`search=${term}`))
}

test.describe('products', () => {
  test('lists seeded products with pagination', async ({ page }) => {
    await page.goto('/products')

    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
    await expect(page.getByText(/Showing 1–10 of \d+/)).toBeVisible()
  })

  test('creates, edits and deletes a product', async ({ page }) => {
    const sku = `E2E-${uid()}`
    const name = `Playwright ${sku}`

    await createProduct(page, name, sku)
    await search(page, sku)
    // Only data rows have actions; the empty-state row also mentions the search term.
    const row = page
      .getByRole('row', { name: new RegExp(sku) })
      .filter({ has: page.getByRole('button', { name: 'Delete' }) })
    await expect(row).toContainText('$49.50')
    await expect(row).toContainText('Active')

    // Edit
    await row.getByRole('link', { name: 'Edit' }).click()
    await expect(page.getByLabel('Name')).toHaveValue(name)
    await page.getByLabel('Name').fill(`${name} v2`)
    await page.getByLabel('Price (USD)').fill('60')
    await page.getByRole('button', { name: 'Save changes' }).click()

    await search(page, sku)
    await expect(row).toContainText(`${name} v2`)
    await expect(row).toContainText('$60.00')

    // Delete (accept the confirm() prompt)
    page.once('dialog', (dialog) => dialog.accept())
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(row).toHaveCount(0)
    await expect(page.getByText(`No products match “${sku}”.`)).toBeVisible()
  })

  test('shows server validation errors inline', async ({ page }) => {
    const sku = `DUP-${uid()}`
    await createProduct(page, `Original ${sku}`, sku)

    await page.getByRole('link', { name: '+ New product' }).click()
    await page.getByLabel('SKU').fill(sku)
    await page.getByRole('button', { name: 'Create product' }).click()

    await expect(page.getByText('The name field is required.')).toBeVisible()
    await expect(page.getByText('The sku has already been taken.')).toBeVisible()
    await expect(page).toHaveURL(/\/products\/(new|create)/)
  })
})
