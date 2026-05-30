<script setup>
import { useScheduleStore } from '../stores/schedule'

const schedule = useScheduleStore()
</script>

<template>
  <fieldset class="schedule-settings" aria-label="Active timer schedule">
    <legend class="schedule-settings__legend">
      Active hours
      <span class="badge badge--accent schedule-settings__tz">{{ schedule.timezoneAbbr }}</span>
    </legend>
    <div class="schedule-settings__row">
      <div class="form-group">
        <label class="form-label" for="sched-start">Start time</label>
        <input
          id="sched-start"
          :value="schedule.start"
          type="time"
          class="form-input form-input--time"
          @input="schedule.start = $event.target.value"
        />
      </div>
      <span class="schedule-settings__sep" aria-hidden="true">&ndash;</span>
      <div class="form-group">
        <label class="form-label" for="sched-end">End time</label>
        <input
          id="sched-end"
          :value="schedule.end"
          type="time"
          class="form-input form-input--time"
          @input="schedule.end = $event.target.value"
        />
      </div>
    </div>
    <p class="schedule-settings__hint">
      Timers run automatically only within this window.
    </p>
  </fieldset>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.schedule-settings {
  border: 1px solid var(--color-border);
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;

  &__legend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    padding: 0 0.25rem;
  }

  &__tz {
    font-size: 0.65rem;
  }

  &__row {
    display: flex;
    align-items: flex-end;
    gap: $spacing-sm;
    flex-wrap: wrap;
    margin-top: $spacing-xs;
  }

  &__sep {
    font-size: 1.25rem;
    color: var(--color-text-muted);
    padding-bottom: 0.55rem;
    flex-shrink: 0;
  }

  &__hint {
    margin-top: $spacing-xs;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }
}

.form-input--time {
  width: 140px;
}
</style>
