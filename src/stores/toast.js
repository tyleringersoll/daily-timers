import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // Queue of expired timer snapshots waiting for user acknowledgement.
  const queue = ref([])

  const current = computed(() => queue.value[0] ?? null)
  const isEmpty = computed(() => queue.value.length === 0)

  const enqueue = (timer) => {
    if (!queue.value.find((t) => t.id === timer.id)) {
      queue.value.push({ id: timer.id, name: timer.name, minutes: timer.minutes })
    }
  }

  const dismiss = (timerId) => {
    queue.value = queue.value.filter((t) => t.id !== timerId)
  }

  return { current, isEmpty, enqueue, dismiss }
})
