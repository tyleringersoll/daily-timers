<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from './stores/theme'
import { useTimerStore } from './stores/timers'
import { useScheduleStore } from './stores/schedule'
import { useWeeklyTaskStore } from './stores/weeklyTasks'
import { useNotification } from './composables/useNotification'

import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import TimerList from './components/TimerList.vue'
import TimerForm from './components/TimerForm.vue'
import ScheduleSettings from './components/ScheduleSettings.vue'
import WeeklyTaskList from './components/WeeklyTaskList.vue'
import WeeklyTaskForm from './components/WeeklyTaskForm.vue'
import TimerToast from './components/TimerToast.vue'

const theme = useThemeStore()
const timerStore = useTimerStore()
const schedule = useScheduleStore()
const taskStore = useWeeklyTaskStore()
const { requestPermission } = useNotification()

const showTimerForm = ref(false)
const showTaskForm = ref(false)

// Periodic schedule enforcement — pause/resume timers outside work hours.
let scheduleInterval = null

const enforceSchedule = () => {
  if (schedule.isActive()) {
    timerStore.resumeActiveWithinSchedule()
  } else {
    timerStore.pauseAll()
  }
}

onMounted(async () => {
  theme.init()
  schedule.load()
  timerStore.load()
  taskStore.load()
  taskStore.checkAndResetWeek()

  await requestPermission()

  // Resume running timers if we're within the work window.
  if (schedule.isActive()) timerStore.resumeActiveWithinSchedule()

  scheduleInterval = setInterval(enforceSchedule, 60_000)
})

onUnmounted(() => {
  clearInterval(scheduleInterval)
  timerStore.pauseAll()
})

const handleAddTimer = ({ name, minutes }) => timerStore.add(name, minutes)
const handleAddTask = ({ day, text, repeating }) => taskStore.addTask(day, text, repeating)
</script>

<template>
  <div class="app-shell">
    <a href="#main-content" class="skip-nav">Skip to content</a>

    <AppHeader />

    <main id="main-content" class="main-content">

      <!-- ── Timers section ──────────────────────────────────────────────── -->
      <section class="section-card" aria-labelledby="timers-heading">
        <div class="section-header">
          <h2 id="timers-heading">Active Timers</h2>
          <button
            type="button"
            class="btn"
            :class="showTimerForm ? 'btn--ghost' : 'btn--primary'"
            :aria-expanded="showTimerForm"
            aria-controls="timer-form-panel"
            @click="showTimerForm = !showTimerForm"
          >
            {{ showTimerForm ? 'Hide' : 'Add New Timer' }}
          </button>
        </div>

        <Transition name="slide-down">
          <div v-if="showTimerForm" id="timer-form-panel">
            <ScheduleSettings />
            <TimerForm @add-timer="handleAddTimer" />
            <hr class="divider" />
          </div>
        </Transition>

        <TimerList
          :timers="timerStore.timers"
          @start-timer="timerStore.start"
          @pause-timer="timerStore.pause"
          @restart-timer="timerStore.restart"
          @delete-timer="timerStore.remove"
        />
      </section>

      <!-- ── Weekly tasks section ───────────────────────────────────────── -->
      <section class="section-card" aria-labelledby="tasks-heading">
        <div class="section-header">
          <h2 id="tasks-heading">Weekly Tasks</h2>
          <button
            type="button"
            class="btn"
            :class="showTaskForm ? 'btn--ghost' : 'btn--primary'"
            :aria-expanded="showTaskForm"
            aria-controls="task-form-panel"
            @click="showTaskForm = !showTaskForm"
          >
            {{ showTaskForm ? 'Hide' : 'Add Daily Task' }}
          </button>
        </div>

        <Transition name="slide-down">
          <div v-if="showTaskForm" id="task-form-panel">
            <WeeklyTaskForm @add-task="handleAddTask" />
            <hr class="divider" />
          </div>
        </Transition>

        <WeeklyTaskList />
      </section>

    </main>

    <AppFooter />

    <!-- Toast overlay — rendered at body root via Teleport -->
    <TimerToast />
  </div>
</template>

<style lang="scss">
@use './styles/variables' as *;

// ── Panel slide-down transition ───────────────────────────────────────────────
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease, opacity 0.25s ease;
  overflow: hidden;
  max-height: 500px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
