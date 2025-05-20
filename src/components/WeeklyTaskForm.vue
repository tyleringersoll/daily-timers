<script setup>
import { ref } from "vue";
import { DAYS_OF_WEEK, EVERY_DAY } from "../constants";
import { useCurrentDay } from "../composables/useCurrentDay";

const emit = defineEmits(["add-task"]);

const { currentDay } = useCurrentDay();
const selectedDay = ref(currentDay.value);
const taskText = ref("");
const isRepeating = ref(false);

const handleSubmit = () => {
  if (!taskText.value.trim()) return;

  if (selectedDay.value === EVERY_DAY) {
    DAYS_OF_WEEK.forEach((day) => {
      emit("add-task", {
        day,
        text: taskText.value.trim(),
        repeating: isRepeating.value,
      });
    });
  } else {
    emit("add-task", {
      day: selectedDay.value,
      text: taskText.value.trim(),
      repeating: isRepeating.value,
    });
  }

  taskText.value = "";
};
</script>

<template>
  <div class="mb-6 p-4 bg-gray-100 rounded">
    <h2 class="text-lg font-semibold mb-2">Add Task</h2>
    <div class="flex gap-4 items-center">
      <select v-model="selectedDay" class="px-2 py-1 border rounded h-9 w-60">
        <option value="Every Day" class="font-semibold text-blue-600">
          Every Day
        </option>
        <option
          v-for="day in DAYS_OF_WEEK"
          :key="day"
          :value="day"
          :class="{ 'font-semibold': day === currentDay }"
        >
          {{ day }}{{ day === currentDay ? " (Today)" : "" }}
        </option>
      </select>
      <input
        v-model="taskText"
        type="text"
        placeholder="Enter task"
        class="px-2 py-1 border rounded h-9 w-60"
        @keyup.enter="handleSubmit"
      />
      <button
        @click="handleSubmit"
        class="px-4 w-36 bg-blue-500 text-white rounded hover:bg-blue-600 h-9"
      >
        Add Task
      </button>
    </div>
    <div class="flex items-center gap-2 px-1">
      <input
        type="checkbox"
        id="repeat-task"
        v-model="isRepeating"
        class="h-4 w-4"
      />
      <label for="repeat-task" class="text-sm text-gray-600">
        Repeat weekly
      </label>
    </div>
  </div>
</template>
