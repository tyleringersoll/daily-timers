<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add-timer'])

const name = ref('')
const minutes = ref(null)
const nameInput = ref(null)

const handleSubmit = () => {
  if (!name.value.trim()) {
    nameInput.value?.focus()
    return
  }
  emit('add-timer', {
    name: name.value.trim(),
    minutes: minutes.value > 0 ? Number(minutes.value) : 5,
  })
  name.value = ''
  minutes.value = null
  nameInput.value?.focus()
}
</script>

<template>
  <form class="timer-form" @submit.prevent="handleSubmit" novalidate aria-label="Add timer">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="timer-name">Timer name</label>
        <input
          id="timer-name"
          ref="nameInput"
          v-model="name"
          type="text"
          class="form-input"
          placeholder="Timer name"
          autocomplete="off"
          required
          aria-required="true"
        />
      </div>
      <div class="form-group">
        <label class="form-label" for="timer-minutes">Duration</label>
        <input
          id="timer-minutes"
          v-model="minutes"
          type="number"
          class="form-input"
          min="1"
          max="480"
          placeholder="Minutes (default 5)"
        />
      </div>
      <button type="submit" class="btn btn--primary">
        Add Timer
      </button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.timer-form {
  margin-top: $spacing-sm;
}
</style>
