<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer" role="contentinfo">
    <div class="app-footer__inner">
      <span class="app-footer__copy">
        &copy;{{ year }}
        <a href="https://tyleringersoll.com" target="_blank" rel="noopener noreferrer">
          Tyler Ingersoll
        </a>
      </span>
      <span class="app-footer__divider" aria-hidden="true">&mdash;</span>
      <a
        href="https://github.com/tyleringersoll/daily-timers"
        class="app-footer__link"
        target="_blank"
        rel="noopener noreferrer"
      >
        View source
      </a>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);

  &__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    max-width: $container-max;
    margin: 0 auto;
    padding: $spacing-sm $container-padding;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  &__copy {
    a {
      color: var(--color-link);
      font-weight: 600;

      &:hover { color: var(--color-link-hover); }
    }
  }

  &__divider {
    color: var(--color-border);
  }

  &__link {
    color: var(--color-text-muted);
    @include transition(color);

    &:hover { color: var(--color-accent-line); }
  }
}
</style>
