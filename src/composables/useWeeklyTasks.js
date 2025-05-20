import { ref, watch } from "vue";
import { DAYS_OF_WEEK, WEEKLY_TASKS_KEY } from "../constants";

export function useWeeklyTasks() {
  const weeklyTasks = ref({});
  const taskCompletion = ref({});
  let lastTaskId = 0;

  DAYS_OF_WEEK.forEach((day) => {
    if (!weeklyTasks.value[day]) {
      weeklyTasks.value[day] = [];
    }
    if (!taskCompletion.value[day]) {
      taskCompletion.value[day] = {};
    }
  });

  const generateUniqueId = () => {
    lastTaskId++;
    return `${Date.now()}-${lastTaskId}`;
  };

  const addTask = (day, taskText, repeating = false) => {
    if (!weeklyTasks.value[day]) {
      weeklyTasks.value[day] = [];
    }

    const newTask = {
      id: generateUniqueId(),
      text: taskText,
      repeating: repeating,
    };

    weeklyTasks.value = {
      ...weeklyTasks.value,
      [day]: [...(weeklyTasks.value[day] || []), newTask],
    };
  };

  const removeTask = (day, taskId) => {
    if (weeklyTasks.value[day]) {
      weeklyTasks.value = {
        ...weeklyTasks.value,
        [day]: weeklyTasks.value[day].filter((task) => task.id !== taskId),
      };
    }
    if (taskCompletion.value[day]) {
      const newCompletion = { ...taskCompletion.value[day] };
      delete newCompletion[taskId];
      taskCompletion.value = {
        ...taskCompletion.value,
        [day]: newCompletion,
      };
    }
  };

  const toggleTaskCompletion = (day, taskId) => {
    if (!taskCompletion.value[day]) {
      taskCompletion.value[day] = {};
    }

    taskCompletion.value = {
      ...taskCompletion.value,
      [day]: {
        ...taskCompletion.value[day],
        [taskId]: !taskCompletion.value[day][taskId],
      },
    };
  };

  let saveTimeout;

  watch(
    weeklyTasks,
    (newTasks) => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        localStorage.setItem(WEEKLY_TASKS_KEY, JSON.stringify(newTasks));
      }, 100);
    },
    { deep: true }
  );

  watch(
    taskCompletion,
    (newCompletion) => {
      localStorage.setItem(
        "vue-tasks-completion",
        JSON.stringify(newCompletion)
      );
    },
    { deep: true }
  );

  const loadTasks = () => {
    const savedTasks = localStorage.getItem(WEEKLY_TASKS_KEY);
    const savedCompletion = localStorage.getItem("vue-tasks-completion");

    if (savedTasks) {
      weeklyTasks.value = JSON.parse(savedTasks);

      Object.values(weeklyTasks.value)
        .flat()
        .forEach((task) => {
          const idParts = task.id.split("-");
          if (idParts.length > 1) {
            const id = parseInt(idParts[1]);
            if (!isNaN(id) && id > lastTaskId) {
              lastTaskId = id;
            }
          }
        });
    }

    if (savedCompletion) {
      taskCompletion.value = JSON.parse(savedCompletion);
    }
  };

  const checkAndResetWeek = () => {
    const now = new Date();
    const lastResetStr = localStorage.getItem("lastWeeklyReset");

    if (lastResetStr) {
      const lastReset = new Date(lastResetStr);
      const daysSinceReset = Math.floor(
        (now - lastReset) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceReset >= 7) {
        DAYS_OF_WEEK.forEach((day) => {
          if (weeklyTasks.value[day]) {
            weeklyTasks.value[day] = weeklyTasks.value[day].filter(
              (task) => task.repeating
            );
          }
          taskCompletion.value[day] = {};
        });
        localStorage.setItem("lastWeeklyReset", now.toISOString());
      }
    } else {
      localStorage.setItem("lastWeeklyReset", now.toISOString());
    }
  };

  return {
    weeklyTasks,
    taskCompletion,
    addTask,
    removeTask,
    toggleTaskCompletion,
    loadTasks,
    checkAndResetWeek,
  };
}
