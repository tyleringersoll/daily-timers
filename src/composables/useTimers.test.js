// The timer logic now lives in the Pinia store (src/stores/timers.js).
// These tests verify the store's core actions in isolation.
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTimerStore } from '../stores/timers'
import { formatTime } from '../utils/formatTime'

vi.mock('../composables/useAudio', () => ({
  useAudio: () => ({ playSound: vi.fn() }),
}))

vi.mock('../composables/useNotification', () => ({
  useNotification: () => ({ sendNotification: vi.fn() }),
}))

vi.mock('../stores/toast', () => ({
  useToastStore: () => ({ enqueue: vi.fn() }),
}))

describe('useTimerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('add() creates a timer with correct properties', () => {
    const store = useTimerStore()
    store.add('Test Timer', 10)
    expect(store.timers).toHaveLength(1)
    expect(store.timers[0]).toMatchObject({
      name: 'Test Timer',
      minutes: 10,
      remaining: 600,
      isRunning: true,
    })
  })

  test('remove() deletes the timer', () => {
    const store = useTimerStore()
    store.add('Test Timer', 5)
    store.remove(store.timers[0])
    expect(store.timers).toHaveLength(0)
  })

  test('pause() stops the interval and clears isRunning', () => {
    const store = useTimerStore()
    store.add('Test Timer', 5)
    const timer = store.timers[0]
    store.pause(timer)
    expect(timer.isRunning).toBe(false)
    expect(timer.intervalId).toBeNull()
  })

  test('restart() resets remaining to full duration', () => {
    const store = useTimerStore()
    store.add('Test Timer', 5)
    const timer = store.timers[0]
    // Simulate some elapsed time.
    timer.remaining = 100
    store.restart(timer)
    expect(store.timers[0].remaining).toBe(300)
    expect(store.timers[0].isRunning).toBe(true)
  })
})

describe('formatTime utility', () => {
  test('formats seconds under an hour as M:SS', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(300)).toBe('5:00')
  })

  test('formats seconds over an hour as H:MM:SS', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3661)).toBe('1:01:01')
  })

  test('clamps negative values to 0:00', () => {
    expect(formatTime(-5)).toBe('0:00')
  })
})
