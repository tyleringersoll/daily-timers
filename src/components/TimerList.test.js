import { describe, test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerList from './TimerList.vue'

const mockTimers = [
  { id: 1, name: 'Test Timer', minutes: 5, remaining: 300, isRunning: false, intervalId: null },
]

describe('TimerList', () => {
  test('renders timer names and formatted time', () => {
    const wrapper = mount(TimerList, { props: { timers: mockTimers } })
    expect(wrapper.text()).toContain('Test Timer')
    expect(wrapper.text()).toContain('5:00')
  })

  test('shows empty state when no timers', () => {
    const wrapper = mount(TimerList, { props: { timers: [] } })
    expect(wrapper.text()).toContain('No timers yet')
  })

  test('emits start-timer when Start is clicked', async () => {
    const wrapper = mount(TimerList, { props: { timers: mockTimers } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('start-timer')).toBeTruthy()
    expect(wrapper.emitted('start-timer')[0][0]).toEqual(mockTimers[0])
  })
})
