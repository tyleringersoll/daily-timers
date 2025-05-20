<script setup>
import { ref, watch } from "vue";
import { DAYS_OF_WEEK } from "../constants";
import { useCurrentDay } from "../composables/useCurrentDay";

const props = defineProps({
  weeklyTasks: {
    type: Object,
    required: true,
  },
  taskCompletion: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["toggle-task", "remove-task", "edit-task"]);
const { currentDay } = useCurrentDay();
const showAllDays = ref(false);
const toggleView = () => {
  showAllDays.value = !showAllDays.value;
};
const currentDayTasks = () => {
  return props.weeklyTasks[currentDay.value] || [];
};

watch(showAllDays, () => {
  editingTaskId.value = null;
  editingTaskText.value = "";
});

watch(
  () => props.weeklyTasks,
  () => {
    editingTaskId.value = null;
    editingTaskText.value = "";
  },
  { deep: true }
);

const editingTaskId = ref(null);
const editingTaskText = ref("");

const startEditing = (task) => {
  editingTaskId.value = task.id;
  editingTaskText.value = task.text;
};

const saveEdit = (day, task) => {
  if (editingTaskText.value.trim()) {
    emit("edit-task", {
      day,
      taskId: task.id,
      newText: editingTaskText.value.trim(),
    });

    editingTaskId.value = null;
    editingTaskText.value = "";
  }
};

const cancelEdit = () => {
  editingTaskId.value = null;
  editingTaskText.value = "";
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold" v-if="!showAllDays">
        {{ currentDay }} Tasks
      </h2>
      <h2 class="text-xl font-semibold" v-else>All Weekly Tasks</h2>
      <button
        @click="toggleView"
        class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2"
      >
        <span v-if="showAllDays">Show Today Only</span>
        <span v-else>View All Tasks</span>
      </button>
    </div>

    <!-- Daily View -->
    <div v-if="!showAllDays" class="p-4 border rounded">
      <div v-if="currentDayTasks().length > 0" class="space-y-2">
        <div
          v-for="task in currentDayTasks()"
          :key="task.id"
          class="flex items-center gap-2 p-2 hover:bg-gray-50"
        >
          <input
            type="checkbox"
            :checked="taskCompletion[currentDay]?.[task.id]"
            @change="emit('toggle-task', { day: currentDay, taskId: task.id })"
            class="w-4 h-4"
          />
          <span
            :class="{
              'line-through text-gray-500':
                taskCompletion[currentDay]?.[task.id],
            }"
          >
            {{ task.text }}
          </span>
        </div>
      </div>
      <div v-else class="text-gray-500 italic">
        No tasks for {{ currentDay }}
      </div>
    </div>

    <!-- Weekly View -->
    <div v-else class="space-y-4">
      <div
        v-for="day in DAYS_OF_WEEK"
        :key="day"
        class="p-4 border rounded"
        :data-testid="`day-section-${day}`"
      >
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-lg font-semibold">{{ day }}</h3>
          <span
            v-if="day === currentDay"
            class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded"
          >
            Today
          </span>
        </div>
        <div v-if="props.weeklyTasks[day] && props.weeklyTasks[day].length > 0">
          <div
            v-for="task in props.weeklyTasks[day]"
            :key="task.id"
            class="flex items-center gap-2 p-2"
            :data-testid="`task-row-${day}-${task.id}`"
          >
            <input
              type="checkbox"
              :checked="props.taskCompletion[day]?.[task.id]"
              @change="emit('toggle-task', { day, taskId: task.id })"
              :data-testid="`checkbox-${day}-${task.id}`"
            />
            <template v-if="editingTaskId === task.id">
              <input
                type="text"
                v-model="editingTaskText"
                :data-testid="`edit-input-${day}-${task.id}`"
                @keyup.enter="saveEdit(day, task)"
              />
              <div class="ml-auto flex gap-2">
                <button
                  @click="saveEdit(day, task)"
                  :data-testid="`save-btn-${day}-${task.id}`"
                  class="text-green-600 hover:underline text-xs"
                >
                  Save
                </button>
                <button
                  @click="cancelEdit"
                  :data-testid="`cancel-btn-${day}-${task.id}`"
                  class="text-gray-500 hover:underline text-xs"
                >
                  Cancel
                </button>
              </div>
            </template>
            <template v-else>
              <span>{{ task.text }}</span>
              <span
                v-if="task.repeating"
                class="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                >repeating</span
              >
              <div class="ml-auto flex gap-2">
                <button
                  @click="startEditing(task)"
                  :data-testid="`edit-btn-${day}-${task.id}`"
                  class="text-blue-500 hover:underline text-xs"
                >
                  Edit
                </button>
                <button
                  @click="emit('remove-task', { day, taskId: task.id })"
                  :data-testid="`delete-btn-${day}-${task.id}`"
                  class="text-red-500 hover:underline text-xs"
                >
                  Delete
                </button>
              </div>
            </template>
          </div>
        </div>
        <div v-else>No tasks for {{ day }}</div>
      </div>
    </div>
  </div>
</template>
