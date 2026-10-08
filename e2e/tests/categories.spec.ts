import { expect, test } from '@playwright/test'

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

test.describe('categories', () => {
  test('creates, edits and deletes a category in the modal', async ({ page }) => {
    const name = `E2E Category ${uid()}`
    await page.goto('/categories')

    // Create
    await page.getByRole('button', { name: '+ New category' }).click()
    const dialog = page.getByRole('dialog', { name: 'New category' })
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Name').fill(name)
    await dialog.getByLabel('Description').fill('From Playwright')
    await dialog.getByRole('button', { name: 'Create category' }).click()
    await expect(dialog).toBeHidden()

    await page.getByLabel('Search categories').fill(name)
    // Only data rows have actions; the empty-state row also mentions the search term.
    const row = page
      .getByRole('row', { name: new RegExp(name) })
      .filter({ has: page.getByRole('button', { name: 'Delete' }) })
    await expect(row).toContainText('From Playwright')

    // Edit
    await row.getByRole('button', { name: 'Edit' }).click()
    const editDialog = page.getByRole('dialog', { name: 'Edit category' })
    await expect(editDialog.getByLabel('Name')).toHaveValue(name)
    await editDialog.getByLabel('Description').fill('Updated description')
    await editDialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(editDialog).toBeHidden()
    await expect(row).toContainText('Updated description')

    // Delete
    page.once('dialog', (d) => d.accept())
    await row.getByRole('button', { name: 'Delete' }).click()
    await expect(row).toHaveCount(0)
  })

  test('validates in the modal and closes with Cancel', async ({ page }) => {
    await page.goto('/categories')
    await page.getByRole('button', { name: '+ New category' }).click()
    const dialog = page.getByRole('dialog', { name: 'New category' })

    await dialog.getByRole('button', { name: 'Create category' }).click()
    await expect(dialog.getByText('The name field is required.')).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
  })

  test('new categories appear in the product form', async ({ page }) => {
    const name = `Pickable ${uid()}`
    await page.goto('/categories')
    await page.getByRole('button', { name: '+ New category' }).click()
    const dialog = page.getByRole('dialog', { name: 'New category' })
    await dialog.getByLabel('Name').fill(name)
    await dialog.getByRole('button', { name: 'Create category' }).click()
    await expect(dialog).toBeHidden()

    await page.goto('/products')
    await page.getByRole('link', { name: '+ New product' }).click()
    await expect(page.getByLabel('Category').locator('option', { hasText: name })).toHaveCount(1)
  })
})
