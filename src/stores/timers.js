import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { STORAGE_KEY } from '../constants'
import { useAudio } from '../composables/useAudio'
import { useNotification } from '../composables/useNotification'
import { useToastStore } from './toast'

export const useTimerStore = defineStore('timers', () => {
  const timers = ref([])
  const { playSound } = useAudio()
  const { sendNotification } = useNotification()

  const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) timers.value = JSON.parse(raw)
  }

  const add = (name, minutes = 5) => {
    if (!name?.trim()) return
    const timer = {
      id: Date.now(),
      name: name.trim(),
      minutes: Number(minutes),
      remaining: Number(minutes) * 60,
      intervalId: null,
      isRunning: false,
    }
    timers.value.push(timer)
    start(timer)
  }

  const _getTimer = (timerOrId) => {
    const id = typeof timerOrId === 'object' ? timerOrId.id : timerOrId
    return timers.value.find((t) => t.id === id)
  }

  const start = (timerOrId) => {
    const t = _getTimer(timerOrId)
    if (!t || t.intervalId) return
    // Guard: never start a depleted timer from 0 — caller should use restart().
    if (t.remaining <= 0) t.remaining = t.minutes * 60
    t.isRunning = true
    t.intervalId = setInterval(() => {
      const current = _getTimer(t.id)
      if (!current) return
      current.remaining -= 1
      if (current.remaining <= 0) {
        pause(current)
        playSound()
        sendNotification(`Timer: ${current.name}`, { body: 'Time is up!' })
        useToastStore().enqueue(current)
      }
    }, 1000)
  }

  const pause = (timerOrId) => {
    const t = _getTimer(timerOrId)
    if (!t) return
    t.isRunning = false
    if (t.intervalId) {
      clearInterval(t.intervalId)
      t.intervalId = null
    }
  }

  const restart = (timerOrId) => {
    const t = _getTimer(timerOrId)
    if (!t) return
    pause(t)
    t.remaining = t.minutes * 60
    start(t)
  }

  const remove = (timerOrId) => {
    const t = _getTimer(timerOrId)
    if (!t) return
    pause(t)
    timers.value = timers.value.filter((x) => x.id !== t.id)
  }

  const pauseAll = () => timers.value.forEach(pause)

  const resumeActiveWithinSchedule = () => {
    timers.value.forEach((t) => {
      if (t.isRunning && !t.intervalId) start(t)
    })
  }

  watch(
    timers,
    (val) => {
      const toSave = val.map((t) => ({ ...t, intervalId: null }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    },
    { deep: true },
  )

  return { timers, load, add, start, pause, restart, remove, pauseAll, resumeActiveWithinSchedule }
})
