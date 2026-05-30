import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ScheduleSettings from './ScheduleSettings.vue'
import { useScheduleStore } from '../stores/schedule'

describe('ScheduleSettings', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  const mountIt = () => mount(ScheduleSettings, { global: { plugins: [pinia] } })

  it('renders two time inputs', () => {
    const wrapper = mountIt()
    expect(wrapper.findAll('input[type="time"]')).toHaveLength(2)
  })

  it('shows default schedule times from the store', () => {
    const wrapper = mountIt()
    const [start, end] = wrapper.findAll('input[type="time"]')
    expect(start.element.value).toBe('09:00')
    expect(end.element.value).toBe('17:00')
  })

  it('updates store start when input changes', async () => {
    const wrapper = mountIt()
    const schedule = useScheduleStore()
    await wrapper.findAll('input[type="time"]')[0].setValue('10:00')
    expect(schedule.start).toBe('10:00')
  })

  it('updates store end when input changes', async () => {
    const wrapper = mountIt()
    const schedule = useScheduleStore()
    await wrapper.findAll('input[type="time"]')[1].setValue('18:00')
    expect(schedule.end).toBe('18:00')
  })
})
