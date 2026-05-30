<script setup>
import { ref, watch, nextTick } from 'vue'
import { useToastStore } from '../stores/toast'
import { useTimerStore } from '../stores/timers'

const toast = useToastStore()
const timerStore = useTimerStore()

const restartBtn = ref(null)
const dismissBtn = ref(null)

// Focus the restart button whenever a new toast becomes current.
watch(
  () => toast.current,
  async (val) => {
    if (val) {
      await nextTick()
      restartBtn.value?.focus()
    }
  },
)

const handleRestart = () => {
  if (!toast.current) return
  timerStore.restart(toast.current.id)
  toast.dismiss(toast.current.id)
}

const handleDismiss = () => {
  if (!toast.current) return
  toast.dismiss(toast.current.id)
}

// Keyboard: Escape to dismiss, Tab trap within toast.
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    handleDismiss()
    return
  }
  if (e.key === 'Tab') {
    const focusable = [restartBtn.value, dismissBtn.value].filter(Boolean)
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toast.current"
        class="toast-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="`Timer complete: ${toast.current.name}`"
        @keydown="handleKeydown"
        @click.self="handleDismiss"
      >
        <div class="toast-card">
          <div class="toast-card__icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="toast-card__label">Time&rsquo;s up!</p>
          <h2 class="toast-card__name">{{ toast.current.name }}</h2>
          <p class="toast-card__sub">{{ toast.current.minutes }}-minute timer completed</p>
          <div class="toast-card__actions">
            <button
              ref="restartBtn"
              type="button"
              class="btn btn--primary"
              @click="handleRestart"
            >
              Done &mdash; Restart
            </button>
            <button
              ref="dismissBtn"
              type="button"
              class="btn btn--ghost btn--sm"
              @click="handleDismiss"
            >
              Dismiss
            </button>
          </div>
          <p class="toast-card__hint">
            <kbd>Enter</kbd> to restart &nbsp; <kbd>Esc</kbd> to dismiss
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.toast-backdrop {
  position: fixed;
  inset: 0;
  z-index: $z-overlay;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: $spacing-md;
}

.toast-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-accent-line);
  border-radius: $radius-lg;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px color-mix(in srgb, var(--color-accent-line) 30%, transparent);
  padding: $spacing-xl $spacing-lg;
  max-width: 340px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;

  &__icon {
    color: var(--color-accent-line);
    margin-bottom: 0.25rem;
  }

  &__label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-accent-line);
  }

  &__name {
    font-size: 1.5rem;
    color: var(--color-text-primary);
    margin: 0.25rem 0;
  }

  &__sub {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: $spacing-sm;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    width: 100%;
    align-items: center;
  }

  &__hint {
    margin-top: $spacing-xs;
    font-size: 0.75rem;
    color: var(--color-text-muted);

    kbd {
      display: inline-block;
      font-family: $font-family-mono;
      font-size: 0.7rem;
      padding: 0.1em 0.4em;
      border: 1px solid var(--color-border);
      border-radius: $radius-sm;
      background: var(--color-bg-surface);
      color: var(--color-text-secondary);
    }
  }
}

// Transition
.toast-enter-active,
.toast-leave-active { transition: opacity $transition-fast, transform $transition-fast; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: scale(0.95); }
</style>
