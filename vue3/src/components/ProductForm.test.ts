import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ProductForm from './ProductForm.vue'

const categories = [
  { id: 1, name: 'Hardware', description: null },
  { id: 2, name: 'Software', description: null },
] as never

describe('ProductForm', () => {
  it('emits only the input fields, with typed values', async () => {
    const wrapper = mount(ProductForm, { props: { categories } })

    await wrapper.find('#name').setValue('  Starter Plan ')
    await wrapper.find('#sku').setValue('PLAN-1')
    await wrapper.find('#category_id').setValue('2')
    await wrapper.find('#price').setValue('19.99')
    await wrapper.find('#stock').setValue('5')
    await wrapper.find('#description').setValue('   ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')![0]![0]).toEqual({
      name: 'Starter Plan',
      sku: 'PLAN-1',
      category_id: 2,
      price: 19.99,
      stock: 5,
      description: null, // blank description is normalised to null
      is_active: true,
    })
  })

  it('prefills from initial values and ignores extra product fields', async () => {
    const initial = { id: 9, created_at: 'x', name: 'Widget', sku: 'W-1', price: 3, stock: 1, is_active: false }
    const wrapper = mount(ProductForm, { props: { initial } })

    expect((wrapper.find('#name').element as HTMLInputElement).value).toBe('Widget')
    await wrapper.find('form').trigger('submit')
    const emitted = wrapper.emitted('submit')![0]![0] as Record<string, unknown>
    expect(emitted).not.toHaveProperty('id')
    expect(emitted).not.toHaveProperty('created_at')
    expect(emitted.is_active).toBe(false)
  })

  it('shows the first validation error for each field', () => {
    const wrapper = mount(ProductForm, { props: { errors: { sku: ['The sku has already been taken.', 'other'] } } })

    expect(wrapper.find('.field--error #sku').exists()).toBe(true)
    expect(wrapper.find('.field__error').text()).toBe('The sku has already been taken.')
  })

  it('disables submit while submitting and emits cancel', async () => {
    const wrapper = mount(ProductForm, { props: { submitting: true } })
    const submit = wrapper.find('button[type="submit"]')

    expect(submit.attributes('disabled')).toBeDefined()
    expect(submit.text()).toBe('Saving…')

    await wrapper.find('button[type="button"]').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
