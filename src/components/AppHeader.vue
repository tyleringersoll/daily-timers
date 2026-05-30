<script setup>
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <svg class="app-header__icon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="8" stroke="currentColor" stroke-width="1.75"/>
          <path d="M12 9v4l2.5 2.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
          <path d="M9 2h6M12 2v2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
        <span class="app-header__title">Daily Timers</span>
      </div>

      <nav class="app-header__nav" aria-label="Site">
        <a
          href="https://ingersoll.dev"
          class="app-header__nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >ingersoll.dev</a>
      </nav>

      <button
        type="button"
        class="theme-toggle"
        :aria-label="theme.label"
        :title="theme.label"
        @click="theme.toggle"
      >
        <!-- Sun icon (shown in dark mode — click to go light) -->
        <svg v-if="theme.isDark" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.75"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
        <!-- Moon icon (shown in light mode — click to go dark) -->
        <svg v-else aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.app-header {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  border-bottom: 1px solid var(--color-border);

  // Frosted glass via pseudo-element (keeps backdrop-filter from affecting children)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--color-bg-header);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: -1;
  }

  &__inner {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    max-width: $container-max;
    margin: 0 auto;
    padding: 0 $container-padding;
    height: $header-height;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    color: var(--color-text-primary);
    text-decoration: none;
  }

  &__icon {
    color: var(--color-accent-line);
    flex-shrink: 0;
  }

  &__title {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-primary);
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__nav-link {
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    text-decoration: none;
    @include transition(color);

    &:hover { color: var(--color-accent-line); }
  }
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  @include transition(border-color, color, background-color);

  &:hover {
    border-color: var(--color-accent-line);
    color: var(--color-accent-line);
    background: color-mix(in srgb, var(--color-accent-line) 10%, transparent);
  }

  &:focus-visible {
    @include focus-ring($radius-pill);
  }
}
</style>
