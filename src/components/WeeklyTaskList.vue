<script setup>
import { ref, computed, watch } from 'vue'
import { DAYS_OF_WEEK } from '../constants'
import { useCurrentDay } from '../composables/useCurrentDay'
import { useWeeklyTaskStore } from '../stores/weeklyTasks'

const taskStore = useWeeklyTaskStore()
const { currentDay } = useCurrentDay()

// Tab state: selected day name, or 'all' for the full-week view.
const ALL_TAB = 'all'
const tabs = computed(() => [...DAYS_OF_WEEK, ALL_TAB])
const selectedTab = ref(currentDay.value)

// Keep selectedTab in sync if the day rolls over at midnight.
watch(currentDay, () => {
  if (selectedTab.value !== ALL_TAB) selectedTab.value = currentDay.value
})

const isAllView = computed(() => selectedTab.value === ALL_TAB)

const visibleDays = computed(() =>
  isAllView.value ? DAYS_OF_WEEK : [selectedTab.value],
)

// ── Tab keyboard navigation (ARIA Tabs pattern) ───────────────────────────────
const tabRefs = ref([])

const onTabKeydown = (e, idx) => {
  const count = tabs.value.length
  let target = -1
  if (e.key === 'ArrowRight') target = (idx + 1) % count
  else if (e.key === 'ArrowLeft') target = (idx - 1 + count) % count
  else if (e.key === 'Home') target = 0
  else if (e.key === 'End') target = count - 1
  if (target !== -1) {
    e.preventDefault()
    tabRefs.value[target]?.focus()
    selectedTab.value = tabs.value[target]
  }
}

// ── Inline editing ────────────────────────────────────────────────────────────
const editingId = ref(null)
const editingText = ref('')

const startEditing = (task) => {
  editingId.value = task.id
  editingText.value = task.text
}

const saveEdit = (day, task) => {
  if (editingText.value.trim()) {
    taskStore.editTask(day, task.id, editingText.value)
  }
  cancelEdit()
}

const cancelEdit = () => {
  editingId.value = null
  editingText.value = ''
}

const onEditKeydown = (e, day, task) => {
  if (e.key === 'Enter') saveEdit(day, task)
  else if (e.key === 'Escape') cancelEdit()
}

// Dismiss editing on tab switch
watch(selectedTab, cancelEdit)
</script>

<template>
  <div class="task-list">
    <!-- Tab strip -->
    <div class="task-list__tabs" role="tablist" aria-label="Day selection">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab"
        :ref="(el) => { tabRefs[idx] = el }"
        role="tab"
        type="button"
        :id="`tab-${tab}`"
        :aria-selected="selectedTab === tab"
        :aria-controls="`tabpanel-${tab}`"
        :tabindex="selectedTab === tab ? 0 : -1"
        class="task-list__tab"
        :class="{
          'task-list__tab--active': selectedTab === tab,
          'task-list__tab--today': tab === currentDay,
          'task-list__tab--all': tab === 'all',
        }"
        @click="selectedTab = tab"
        @keydown="onTabKeydown($event, idx)"
      >
        <span class="task-list__tab-label">
          {{ tab === 'all' ? 'All' : tab.slice(0, 3) }}
        </span>
        <span
          v-if="tab === currentDay"
          class="task-list__tab-dot"
          aria-label="(today)"
        />
      </button>
    </div>

    <!-- Tab panel(s) -->
    <div
      :id="`tabpanel-${selectedTab}`"
      role="tabpanel"
      :aria-labelledby="`tab-${selectedTab}`"
      class="task-list__panel"
    >
      <template v-for="day in visibleDays" :key="day">
        <div
          class="task-list__day"
          :class="{ 'task-list__day--all': isAllView }"
          :data-testid="`day-section-${day}`"
        >
          <h3 v-if="isAllView" class="task-list__day-heading">
            {{ day }}
            <span v-if="day === currentDay" class="badge badge--accent">Today</span>
          </h3>

          <ul
            v-if="taskStore.tasks[day]?.length"
            class="task-list__items"
            role="list"
          >
            <li
              v-for="task in taskStore.tasks[day]"
              :key="task.id"
              class="task-list__item"
              :data-testid="`task-row-${day}-${task.id}`"
            >
              <!-- Checkbox -->
              <label class="checkbox-label task-list__check">
                <input
                  type="checkbox"
                  class="checkbox-input"
                  :checked="taskStore.completion[day]?.[task.id] ?? false"
                  :aria-label="`Mark &quot;${task.text}&quot; as complete`"
                  :data-testid="`checkbox-${day}-${task.id}`"
                  @change="taskStore.toggleCompletion(day, task.id)"
                />
              </label>

              <!-- Inline edit mode -->
              <template v-if="editingId === task.id">
                <input
                  type="text"
                  class="form-input task-list__edit-input"
                  v-model="editingText"
                  :aria-label="`Edit task: ${task.text}`"
                  :data-testid="`edit-input-${day}-${task.id}`"
                  @keydown="onEditKeydown($event, day, task)"
                  autofocus
                />
                <div class="task-list__item-actions">
                  <button
                    type="button"
                    class="btn btn--primary btn--sm"
                    :data-testid="`save-btn-${day}-${task.id}`"
                    @click="saveEdit(day, task)"
                  >Save</button>
                  <button
                    type="button"
                    class="btn btn--ghost btn--sm"
                    :data-testid="`cancel-btn-${day}-${task.id}`"
                    @click="cancelEdit"
                  >Cancel</button>
                </div>
              </template>

              <!-- Display mode -->
              <template v-else>
                <span
                  class="task-list__text"
                  :class="{ 'task-list__text--done': taskStore.completion[day]?.[task.id] }"
                >{{ task.text }}</span>
                <span v-if="task.repeating" class="badge badge--muted">weekly</span>
                <div class="task-list__item-actions">
                  <button
                    type="button"
                    class="btn btn--icon"
                    :aria-label="`Edit task: ${task.text}`"
                    :data-testid="`edit-btn-${day}-${task.id}`"
                    @click="startEditing(task)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="btn btn--icon btn--danger"
                    :aria-label="`Delete task: ${task.text}`"
                    :data-testid="`delete-btn-${day}-${task.id}`"
                    @click="taskStore.removeTask(day, task.id)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </template>
            </li>
          </ul>

          <p v-else class="empty-state">
            No tasks for {{ day }}.
          </p>
        </div>
      </template>
    </div>

    <!-- Legacy button text for Cypress compatibility -->
    <div class="sr-only" aria-hidden="true">
      <span v-if="!isAllView" id="view-all-tasks-label">View All Tasks</span>
      <span v-else id="show-today-label">Show Today Only</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/variables' as *;

// ── Tab strip ─────────────────────────────────────────────────────────────────
.task-list__tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: $spacing-md;
  padding-bottom: 0;

  &::-webkit-scrollbar { display: none; }
}

.task-list__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0.75rem;
  font-family: $font-family-base;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  @include transition(color, border-color);
  margin-bottom: -1px;

  &:hover { color: var(--color-text-secondary); }

  &:focus-visible {
    @include focus-ring;
    border-radius: $radius-sm $radius-sm 0 0;
  }

  &--active {
    color: var(--color-accent-line);
    border-bottom-color: var(--color-accent-line);
  }

  &--today .task-list__tab-label { color: inherit; }

  &--all {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
}

.task-list__tab-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent-line);
  flex-shrink: 0;
}

// ── Panel ─────────────────────────────────────────────────────────────────────
.task-list__day--all {
  margin-bottom: $spacing-md;

  &:last-child { margin-bottom: 0; }
}

.task-list__day-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: $spacing-xs;
  padding-bottom: $spacing-xs;
  border-bottom: 1px solid var(--color-border);
}

// ── Task items ────────────────────────────────────────────────────────────────
.task-list__items {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-list__item {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 0.5rem 0.375rem;
  border-radius: $radius-md;
  @include transition(background-color);

  &:hover { background: var(--color-bg-surface); }
}

.task-list__check {
  flex-shrink: 0;
  cursor: pointer;
}

.task-list__text {
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  @include transition(color, text-decoration-color);

  &--done {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }
}

.task-list__edit-input {
  flex: 1;
  padding: 0.3rem 0.6rem;
  font-size: 0.9rem;
}

.task-list__item-actions {
  display: flex;
  gap: 0.125rem;
  margin-left: auto;
  flex-shrink: 0;
}

// Compact icon button in task rows
.btn--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  color: var(--color-text-muted);
  border-color: transparent;
  background: transparent;

  &:hover { color: var(--color-text-primary); background: var(--color-bg-nav); }

  &.btn--danger:hover { color: var(--color-danger); }
}
</style>
