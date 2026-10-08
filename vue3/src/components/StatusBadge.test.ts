import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it.each([
    [true, 'Active', 'badge--active'],
    [false, 'Inactive', 'badge--inactive'],
  ])('active=%s renders %s', (active, label, cls) => {
    const wrapper = mount(StatusBadge, { props: { active } })

    expect(wrapper.text()).toBe(label)
    expect(wrapper.classes()).toContain(cls)
  })
})
