import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { DAYS_OF_WEEK, WEEKLY_TASKS_KEY, TASKS_COMPLETION_KEY } from '../constants'

const LAST_RESET_KEY = 'lastWeeklyReset'

export const useWeeklyTaskStore = defineStore('weeklyTasks', () => {
  const tasks = ref(Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []])))
  const completion = ref(Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, {}])))

  let _nextId = 1
  const _genId = () => `${Date.now()}-${_nextId++}`

  const load = () => {
    const rawTasks = localStorage.getItem(WEEKLY_TASKS_KEY)
    const rawCompletion = localStorage.getItem(TASKS_COMPLETION_KEY)

    if (rawTasks) {
      const parsed = JSON.parse(rawTasks)
      // Reconstruct _nextId from stored IDs to avoid collisions after reload.
      Object.values(parsed)
        .flat()
        .forEach((task) => {
          const n = parseInt(task.id.split('-')[1], 10)
          if (!isNaN(n) && n >= _nextId) _nextId = n + 1
        })
      tasks.value = { ...Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []])), ...parsed }
    }

    if (rawCompletion) {
      completion.value = {
        ...Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, {}])),
        ...JSON.parse(rawCompletion),
      }
    }
  }

  const checkAndResetWeek = () => {
    const now = new Date()
    const lastStr = localStorage.getItem(LAST_RESET_KEY)
    if (lastStr) {
      const daysSince = (now - new Date(lastStr)) / (1000 * 60 * 60 * 24)
      if (daysSince >= 7) _doReset(now)
    } else {
      localStorage.setItem(LAST_RESET_KEY, now.toISOString())
    }
  }

  const _doReset = (now) => {
    DAYS_OF_WEEK.forEach((day) => {
      tasks.value[day] = (tasks.value[day] ?? []).filter((t) => t.repeating)
      completion.value[day] = {}
    })
    localStorage.setItem(LAST_RESET_KEY, now.toISOString())
  }

  const addTask = (day, text, repeating = false) => {
    if (!text?.trim()) return
    const days = day === 'Every Day' ? DAYS_OF_WEEK : [day]
    days.forEach((d) => {
      tasks.value[d] = [
        ...(tasks.value[d] ?? []),
        { id: _genId(), text: text.trim(), repeating },
      ]
    })
  }

  const removeTask = (day, taskId) => {
    tasks.value[day] = (tasks.value[day] ?? []).filter((t) => t.id !== taskId)
    const { [taskId]: _, ...rest } = completion.value[day] ?? {}
    completion.value[day] = rest
  }

  const editTask = (day, taskId, newText) => {
    const idx = (tasks.value[day] ?? []).findIndex((t) => t.id === taskId)
    if (idx === -1 || !newText.trim()) return
    tasks.value[day] = tasks.value[day].map((t) =>
      t.id === taskId ? { ...t, text: newText.trim() } : t,
    )
  }

  const toggleCompletion = (day, taskId) => {
    const current = completion.value[day]?.[taskId] ?? false
    completion.value[day] = { ...completion.value[day], [taskId]: !current }
  }

  let _saveTimer
  watch(
    tasks,
    (val) => {
      clearTimeout(_saveTimer)
      _saveTimer = setTimeout(() => localStorage.setItem(WEEKLY_TASKS_KEY, JSON.stringify(val)), 100)
    },
    { deep: true },
  )

  watch(
    completion,
    (val) => localStorage.setItem(TASKS_COMPLETION_KEY, JSON.stringify(val)),
    { deep: true },
  )

  return { tasks, completion, load, checkAndResetWeek, addTask, removeTask, editTask, toggleCompletion }
})
