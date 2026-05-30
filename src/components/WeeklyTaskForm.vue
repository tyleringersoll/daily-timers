<script setup>
import { ref } from 'vue'
import { DAYS_OF_WEEK, EVERY_DAY } from '../constants'
import { useCurrentDay } from '../composables/useCurrentDay'

const emit = defineEmits(['add-task'])

const { currentDay } = useCurrentDay()
const selectedDay = ref(currentDay.value)
const taskText = ref('')
const isRepeating = ref(false)
const textInput = ref(null)

const handleSubmit = () => {
  if (!taskText.value.trim()) {
    textInput.value?.focus()
    return
  }

  if (selectedDay.value === EVERY_DAY) {
    DAYS_OF_WEEK.forEach((day) => {
      emit('add-task', { day, text: taskText.value.trim(), repeating: isRepeating.value })
    })
  } else {
    emit('add-task', { day: selectedDay.value, text: taskText.value.trim(), repeating: isRepeating.value })
  }

  taskText.value = ''
  textInput.value?.focus()
}
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit" novalidate aria-label="Add task">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="task-day">Day</label>
        <select id="task-day" v-model="selectedDay" class="form-select form-input">
          <option :value="EVERY_DAY">Every Day</option>
          <optgroup label="Specific day">
            <option
              v-for="day in DAYS_OF_WEEK"
              :key="day"
              :value="day"
            >
              {{ day }}
            </option>
          </optgroup>
        </select>
      </div>

      <div class="form-group task-form__text-group">
        <label class="form-label" for="task-text">Task</label>
        <input
          id="task-text"
          ref="textInput"
          v-model="taskText"
          type="text"
          class="form-input"
          placeholder="Enter task"
          autocomplete="off"
          required
          aria-required="true"
        />
      </div>

      <button type="submit" class="btn btn--primary">
        Add Task
      </button>
    </div>

    <label class="checkbox-label task-form__repeat">
      <input
        type="checkbox"
        class="checkbox-input"
        v-model="isRepeating"
      />
      Repeat weekly
    </label>
  </form>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

.task-form {
  margin-top: $spacing-sm;

  &__text-group { flex: 2 1 220px; }

  &__repeat {
    margin-top: $spacing-xs;
  }
}
</style>
