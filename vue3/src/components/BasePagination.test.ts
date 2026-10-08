import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BasePagination from './BasePagination.vue'

const meta = (current_page: number, last_page = 3) => ({
  current_page,
  last_page,
  per_page: 10,
  total: 25,
  from: (current_page - 1) * 10 + 1,
  to: Math.min(current_page * 10, 25),
})

describe('BasePagination', () => {
  it('shows the range and current page', () => {
    const wrapper = mount(BasePagination, { props: { meta: meta(2) } })

    expect(wrapper.text()).toContain('Showing 11–20 of 25')
    expect(wrapper.text()).toContain('2 / 3')
  })

  it('emits the neighbouring page numbers', async () => {
    const wrapper = mount(BasePagination, { props: { meta: meta(2) } })
    const [prev, next] = wrapper.findAll('button')

    await prev!.trigger('click')
    await next!.trigger('click')

    expect(wrapper.emitted('change')).toEqual([[1], [3]])
  })

  it('disables buttons at the edges', () => {
    const first = mount(BasePagination, { props: { meta: meta(1) } }).findAll('button')
    const last = mount(BasePagination, { props: { meta: meta(3) } }).findAll('button')

    expect(first[0]!.attributes('disabled')).toBeDefined()
    expect(last[1]!.attributes('disabled')).toBeDefined()
  })

  it('shows "No results" when empty', () => {
    const wrapper = mount(BasePagination, {
      props: { meta: { ...meta(1, 1), total: 0, from: null, to: null } },
    })

    expect(wrapper.text()).toContain('No results')
  })
})
