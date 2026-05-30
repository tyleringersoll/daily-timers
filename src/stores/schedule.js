import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { SCHEDULE_KEY, DEFAULT_TIMEZONE, DEFAULT_SCHEDULE } from '../constants'

export const useScheduleStore = defineStore('schedule', () => {
  const start = ref(DEFAULT_SCHEDULE.start)
  const end = ref(DEFAULT_SCHEDULE.end)
  const timezone = ref(DEFAULT_TIMEZONE)

  const load = () => {
    const raw = localStorage.getItem(SCHEDULE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    start.value = saved.start ?? DEFAULT_SCHEDULE.start
    end.value = saved.end ?? DEFAULT_SCHEDULE.end
    timezone.value = saved.timezone ?? DEFAULT_TIMEZONE
  }

  const isActive = () => {
    const now = new Date()
    const tzNow = new Date(now.toLocaleString('en-US', { timeZone: timezone.value }))
    const [sh, sm] = start.value.split(':').map(Number)
    const [eh, em] = end.value.split(':').map(Number)
    const startTime = new Date(tzNow)
    startTime.setHours(sh, sm, 0, 0)
    const endTime = new Date(tzNow)
    endTime.setHours(eh, em, 0, 0)
    return tzNow >= startTime && tzNow < endTime
  }

  // Friendly timezone abbreviation (e.g. "EST", "PST")
  const timezoneAbbr = computed(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone.value,
        timeZoneName: 'short',
      })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value ?? timezone.value
    } catch {
      return timezone.value
    }
  })

  watch([start, end, timezone], () => {
    localStorage.setItem(
      SCHEDULE_KEY,
      JSON.stringify({ start: start.value, end: end.value, timezone: timezone.value }),
    )
  })

  return { start, end, timezone, timezoneAbbr, load, isActive }
})
