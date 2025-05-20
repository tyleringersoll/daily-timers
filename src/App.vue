// App.vue script section
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useSchedule } from "./composables/useSchedule";
import { useTimers } from "./composables/useTimers";
import ScheduleSettings from "./components/ScheduleSettings.vue";
import TimerForm from "./components/TimerForm.vue";
import TimerList from "./components/TimerList.vue";
import { useWeeklyTasks } from "./composables/useWeeklyTasks";
import WeeklyTaskForm from "./components/WeeklyTaskForm.vue";
import WeeklyTaskList from "./components/WeeklyTaskList.vue";

const showTimerForm = ref(false);
const showTaskForm = ref(false);

const { scheduleStart, scheduleEnd, timezone, loadSchedule, isWithinSchedule } =
  useSchedule();

const {
  timers,
  addTimer,
  startTimer,
  pauseTimer,
  restartTimer,
  deleteTimer,
  formatTime,
  loadTimers,
} = useTimers();

const {
  weeklyTasks,
  taskCompletion,
  addTask,
  removeTask,
  toggleTaskCompletion,
  loadTasks,
  checkAndResetWeek,
} = useWeeklyTasks();

const startScheduleCheck = () => {
  const interval = setInterval(() => {
    if (isWithinSchedule()) {
      timers.value.forEach((timer) => {
        if (timer.isRunning && !timer.intervalId) {
          startTimer(timer);
        }
      });
    } else {
      timers.value.forEach((timer) => {
        if (timer.intervalId) {
          pauseTimer(timer);
        }
      });
    }
  }, 60000);

  return interval;
};

onMounted(() => {
  loadSchedule();
  loadTimers();
  loadTasks();
  checkAndResetWeek();

  const scheduleInterval = startScheduleCheck();

  if (isWithinSchedule()) {
    timers.value.forEach((timer) => {
      if (timer.isRunning && !timer.intervalId) {
        startTimer(timer);
      }
    });
  }

  onUnmounted(() => {
    clearInterval(scheduleInterval);
    timers.value.forEach(pauseTimer);
  });
});

const handleAddTimer = ({ name, minutes }) => {
  addTimer(name, minutes);
};

const handleAddWeeklyTask = ({ day, text, repeating }) => {
  addTask(day, text, repeating);
};

const handleEditTask = ({ day, taskId, newText }) => {
  const tasks = weeklyTasks.value[day];
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    weeklyTasks.value[day] = [
      ...tasks.slice(0, idx),
      { ...tasks[idx], text: newText },
      ...tasks.slice(idx + 1),
    ];
    if (typeof saveTasks === "function") {
      saveTasks();
    }
  }
};

const handleToggleTask = ({ day, taskId }) => {
  toggleTaskCompletion(day, taskId);
};

const handleRemoveTask = ({ day, taskId }) => {
  removeTask(day, taskId);
};
</script>

<template>
  <div class="min-h-screen pb-16">
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Repeating Timers and Tasks</h1>

      <!-- Active Timers Section -->
      <div class="bg-gray-100 rounded p-4 mb-6">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold mb-6">Active Timers</h2>
          <button
            v-if="!showTimerForm"
            @click="showTimerForm = true"
            class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Timer
          </button>
        </div>
        <div v-if="showTimerForm" class="mb-4">
          <ScheduleSettings
            v-model:scheduleStart="scheduleStart"
            v-model:scheduleEnd="scheduleEnd"
          />
          <TimerForm @add-timer="handleAddTimer" />
          <button
            @click="showTimerForm = false"
            class="mt-2 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Hide
          </button>
        </div>
        <TimerList
          :timers="timers"
          :formatTime="formatTime"
          @start-timer="startTimer"
          @pause-timer="pauseTimer"
          @restart-timer="restartTimer"
          @delete-timer="deleteTimer"
        />
      </div>

      <!-- Weekly Tasks Section -->
      <div class="bg-gray-50 rounded-lg shadow-sm p-6 mt-8 border pt-8">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold">Weekly Tasks</h2>
          <button
            v-if="!showTaskForm"
            @click="showTaskForm = true"
            class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Daily Task
          </button>
        </div>
        <div v-if="showTaskForm" class="mb-4">
          <WeeklyTaskForm @add-task="handleAddWeeklyTask" />
          <button
            @click="showTaskForm = false"
            class="mt-2 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Hide
          </button>
        </div>
        <WeeklyTaskList
          :weekly-tasks="weeklyTasks"
          :task-completion="taskCompletion"
          @toggle-task="handleToggleTask"
          @remove-task="handleRemoveTask"
          @edit-task="handleEditTask"
        />
      </div>
    </div>

    <footer
      class="fixed bottom-0 left-0 w-full text-center bg-white text-sm text-gray-500 py-2 border-t border-gray-300"
    >
      &copy;{{ new Date().getFullYear() }}
      <a href="https://tyleringersoll.com">Tyler Ingersoll</a>
    </footer>
  </div>
</template>
