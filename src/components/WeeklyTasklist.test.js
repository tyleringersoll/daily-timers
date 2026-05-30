import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import WeeklyTaskList from './WeeklyTaskList.vue'
import { useWeeklyTaskStore } from '../stores/weeklyTasks'
import { DAYS_OF_WEEK } from '../constants'

// Pin "current day" to Monday so tests are day-independent.
vi.mock('../composables/useCurrentDay', () => ({
  useCurrentDay: () => ({ currentDay: ref('Monday') }),
}))

function seedStore(store) {
  store.tasks['Monday'] = [
    { id: '1', text: 'Task 1', repeating: false },
    { id: '2', text: 'Task 2', repeating: true },
  ]
  store.completion['Monday'] = { '1': false, '2': true }
}

describe('WeeklyTaskList', () => {
  let pinia, store

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useWeeklyTaskStore()
    seedStore(store)
  })

  const mountIt = () => mount(WeeklyTaskList, { global: { plugins: [pinia] } })

  it("shows today's tasks by default (Monday tab active)", () => {
    const wrapper = mountIt()
    expect(wrapper.text()).toContain('Task 1')
    expect(wrapper.text()).toContain('Task 2')
  })

  it('switches to all-days view when All tab is clicked', async () => {
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')
    for (const day of DAYS_OF_WEEK) {
      expect(wrapper.text()).toContain(day)
    }
  })

  it('calls store.toggleCompletion when a checkbox is changed', async () => {
    vi.spyOn(store, 'toggleCompletion')
    const wrapper = mountIt()
    await wrapper.find('input[type="checkbox"]').trigger('change')
    expect(store.toggleCompletion).toHaveBeenCalledWith('Monday', '1')
  })

  it('shows edit and delete buttons for each task in all-days view', async () => {
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')
    expect(wrapper.find('[data-testid="edit-btn-Monday-1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="delete-btn-Monday-1"]').exists()).toBe(true)
  })

  it('calls store.editTask when task is edited and saved', async () => {
    vi.spyOn(store, 'editTask')
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')

    await wrapper.find('[data-testid="edit-btn-Monday-1"]').trigger('click')
    await wrapper.vm.$nextTick()

    const input = wrapper.find('[data-testid="edit-input-Monday-1"]')
    expect(input.exists()).toBe(true)
    await input.setValue('Updated Task')
    await wrapper.find('[data-testid="save-btn-Monday-1"]').trigger('click')

    expect(store.editTask).toHaveBeenCalledWith('Monday', '1', 'Updated Task')
  })

  it('shows the weekly badge for repeating tasks in all-days view', async () => {
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')
    expect(wrapper.html()).toContain('weekly')
  })

  it('shows empty state for days with no tasks in all-days view', async () => {
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')
    expect(wrapper.text()).toContain('No tasks for Tuesday')
  })

  it('calls store.removeTask when delete button is clicked', async () => {
    vi.spyOn(store, 'removeTask')
    const wrapper = mountIt()
    const allTab = wrapper.findAll('[role="tab"]').find(b => b.text().includes('All'))
    await allTab.trigger('click')
    await wrapper.find('[data-testid="delete-btn-Monday-1"]').trigger('click')
    expect(store.removeTask).toHaveBeenCalledWith('Monday', '1')
  })
})
