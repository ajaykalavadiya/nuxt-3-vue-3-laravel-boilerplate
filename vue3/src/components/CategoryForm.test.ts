import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CategoryForm from './CategoryForm.vue'

describe('CategoryForm', () => {
  it('emits trimmed input', async () => {
    const wrapper = mount(CategoryForm, { props: { initial: { name: 'Old', description: 'Desc' } } })

    await wrapper.find('#category-name').setValue(' Books ')
    await wrapper.find('#category-description').setValue('')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')![0]![0]).toEqual({ name: 'Books', description: null })
  })

  it('shows validation errors', () => {
    const wrapper = mount(CategoryForm, { props: { errors: { name: ['The name field is required.'] } } })

    expect(wrapper.find('.field__error').text()).toBe('The name field is required.')
  })
})
