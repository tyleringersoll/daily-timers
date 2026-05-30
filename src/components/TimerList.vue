<script setup>
import TimerCard from './TimerCard.vue'

const props = defineProps({
  timers: { type: Array, required: true },
})

const emit = defineEmits(['start-timer', 'pause-timer', 'restart-timer', 'delete-timer'])
</script>

<template>
  <section class="timer-list" aria-label="Active timers">
    <p v-if="!timers.length" class="empty-state">
      No timers yet — add one above.
    </p>
    <ul v-else class="timer-list__grid" role="list">
      <li v-for="timer in timers" :key="timer.id" role="listitem">
        <TimerCard
          :timer="timer"
          @start="emit('start-timer', $event)"
          @pause="emit('pause-timer', $event)"
          @restart="emit('restart-timer', $event)"
          @delete="emit('delete-timer', $event)"
        />
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.timer-list__grid {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}
</style>
