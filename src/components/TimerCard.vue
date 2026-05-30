<script setup>
import { computed } from 'vue'
import { formatTime } from '../utils/formatTime'

const props = defineProps({
  timer: { type: Object, required: true },
})

const emit = defineEmits(['start', 'pause', 'restart', 'delete'])

// Circular progress ring geometry
const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const progressOffset = computed(() => {
  const total = props.timer.minutes * 60
  if (total <= 0) return 0
  const frac = Math.max(0, Math.min(1, props.timer.remaining / total))
  // offset = 0 → full circle (just started), offset = circumference → empty (expired)
  return CIRCUMFERENCE * (1 - frac)
})

const isActive = computed(() => props.timer.isRunning && props.timer.intervalId !== null)

const progressColor = computed(() =>
  isActive.value ? 'var(--color-timer-running)' : 'var(--color-timer-paused)',
)

const percentRemaining = computed(() => {
  const total = props.timer.minutes * 60
  if (total <= 0) return 0
  return Math.round((props.timer.remaining / total) * 100)
})
</script>

<template>
  <article
    class="timer-card"
    :class="{ 'timer-card--active': isActive }"
    :aria-label="`${timer.name}, ${formatTime(timer.remaining)} remaining`"
  >
    <!-- Circular progress ring -->
    <div class="timer-card__ring" aria-hidden="true">
      <svg
        :width="RADIUS * 2 + 16"
        :height="RADIUS * 2 + 16"
        :viewBox="`0 0 ${RADIUS * 2 + 16} ${RADIUS * 2 + 16}`"
      >
        <!-- Track -->
        <circle
          :cx="RADIUS + 8"
          :cy="RADIUS + 8"
          :r="RADIUS"
          fill="none"
          stroke="var(--color-timer-track)"
          stroke-width="5"
        />
        <!-- Progress arc -->
        <circle
          :cx="RADIUS + 8"
          :cy="RADIUS + 8"
          :r="RADIUS"
          fill="none"
          :stroke="progressColor"
          stroke-width="5"
          stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE"
          :stroke-dashoffset="progressOffset"
          class="timer-card__arc"
        />
      </svg>
      <div class="timer-card__ring-text">
        <span class="timer-card__time" :class="{ 'timer-card__time--active': isActive }">
          {{ formatTime(timer.remaining) }}
        </span>
      </div>
    </div>

    <!-- Info + controls -->
    <div class="timer-card__body">
      <h3 class="timer-card__name">{{ timer.name }}</h3>
      <p class="timer-card__meta">
        {{ timer.minutes }}-min timer &nbsp;&bull;&nbsp;
        <span :class="isActive ? 'timer-card__status--running' : 'timer-card__status--paused'">
          {{ isActive ? 'Running' : timer.remaining <= 0 ? 'Complete' : 'Paused' }}
        </span>
      </p>

      <!-- Screenreader-only live region for significant state changes -->
      <div class="sr-only" aria-live="polite" aria-atomic="true">
        {{ isActive ? `${timer.name} running, ${percentRemaining}% remaining` : '' }}
      </div>

      <div class="timer-card__controls">
        <!-- Expired: only allow Restart (not Start from 0) -->
        <button
          v-if="!isActive && timer.remaining <= 0"
          type="button"
          class="btn btn--primary btn--sm"
          :aria-label="`Restart ${timer.name}`"
          @click="emit('restart', timer)"
        >
          Restart
        </button>
        <button
          v-else-if="!isActive"
          type="button"
          class="btn btn--primary btn--sm"
          :aria-label="`Start ${timer.name}`"
          @click="emit('start', timer)"
        >
          Start
        </button>
        <button
          v-else
          type="button"
          class="btn btn--ghost btn--sm"
          :aria-label="`Pause ${timer.name}`"
          @click="emit('pause', timer)"
        >
          Pause
        </button>
        <button
          v-if="timer.remaining > 0"
          type="button"
          class="btn btn--ghost btn--sm"
          :aria-label="`Restart ${timer.name}`"
          @click="emit('restart', timer)"
        >
          Restart
        </button>
        <button
          type="button"
          class="btn btn--danger btn--sm"
          :aria-label="`Delete ${timer.name}`"
          @click="emit('delete', timer)"
        >
          Delete
        </button>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.timer-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  padding: $spacing-sm $spacing-md;
  @include transition(border-color, box-shadow);

  &--active {
    border-color: color-mix(in srgb, var(--color-accent-line) 50%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-accent-line) 20%, transparent);
  }

  @include respond-below(sm) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }
}

// ── Ring ──────────────────────────────────────────────────────────────────────
.timer-card__ring {
  position: relative;
  flex-shrink: 0;
}

.timer-card__arc {
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.9s linear, stroke $transition-base;
}

.timer-card__ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-card__time {
  font-family: $font-family-mono;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: -0.02em;

  &--active {
    color: var(--color-accent-line);
  }
}

// ── Body ──────────────────────────────────────────────────────────────────────
.timer-card__body {
  flex: 1;
  min-width: 0;
}

.timer-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timer-card__meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: $spacing-xs;
}

.timer-card__status {
  &--running { color: var(--color-timer-running); font-weight: 600; }
  &--paused  { color: var(--color-timer-paused); }
}

.timer-card__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
</style>
