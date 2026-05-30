import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerForm from './TimerForm.vue'

describe('TimerForm', () => {
  test('emits add-timer with correct data when form is submitted', async () => {
    const wrapper = mount(TimerForm)

    await wrapper.find('input[type="text"]').setValue('Test Timer')
    await wrapper.find('input[type="number"]').setValue('15')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add-timer')).toBeTruthy()
    expect(wrapper.emitted('add-timer')[0][0]).toEqual({
      name: 'Test Timer',
      minutes: 15,
    })
  })

  test('uses default 5 minutes when duration is empty', async () => {
    const wrapper = mount(TimerForm)

    await wrapper.find('input[type="text"]').setValue('Quick timer')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add-timer')[0][0]).toEqual({
      name: 'Quick timer',
      minutes: 5,
    })
  })

  test('does not emit when name is blank', async () => {
    const wrapper = mount(TimerForm)

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('add-timer')).toBeFalsy()
  })

  test('clears fields after successful submission', async () => {
    const wrapper = mount(TimerForm)

    await wrapper.find('input[type="text"]').setValue('Test Timer')
    await wrapper.find('input[type="number"]').setValue('10')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('input[type="text"]').element.value).toBe('')
  })
})
