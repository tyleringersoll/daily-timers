import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'

vi.mock('./composables/useNotification', () => ({
  useNotification: () => ({
    requestPermission: vi.fn().mockResolvedValue(undefined),
    sendNotification: vi.fn(),
  }),
}))

// Stub heavy child components so the test focuses on App orchestration.
const stubs = {
  AppHeader: { template: '<div />' },
  AppFooter: { template: '<div />' },
  TimerList: { template: '<div />', props: ['timers'] },
  TimerForm: { template: '<div />', emits: ['add-timer'] },
  ScheduleSettings: { template: '<div />' },
  WeeklyTaskList: { template: '<div />' },
  WeeklyTaskForm: { template: '<div />', emits: ['add-task'] },
  TimerToast: { template: '<div />' },
}

describe('App.vue', () => {
  let pinia

  beforeEach(() => {
    vi.useFakeTimers()
    pinia = createPinia()
    setActivePinia(pinia)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('mounts and renders main content', async () => {
    const wrapper = mount(App, { global: { plugins: [pinia], stubs } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#main-content').exists()).toBe(true)
  })

  it('reveals the timer form when Add New Timer is clicked', async () => {
    const wrapper = mount(App, { global: { plugins: [pinia], stubs } })
    await wrapper.vm.$nextTick()
    const btn = wrapper.findAll('button').find(b => b.text().includes('Add New Timer'))
    await btn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#timer-form-panel').exists()).toBe(true)
  })

  it('reveals the task form when Add Daily Task is clicked', async () => {
    const wrapper = mount(App, { global: { plugins: [pinia], stubs } })
    await wrapper.vm.$nextTick()
    const btn = wrapper.findAll('button').find(b => b.text().includes('Add Daily Task'))
    await btn.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#task-form-panel').exists()).toBe(true)
  })

  it('unmounts without throwing', () => {
    const wrapper = mount(App, { global: { plugins: [pinia], stubs } })
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
