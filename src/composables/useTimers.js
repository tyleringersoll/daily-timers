import { ref, watch, onMounted } from "vue";
import { STORAGE_KEY } from "../constants";
import { useAudio } from "./useAudio";
import { useNotification } from "./useNotification";

export function useTimers() {
  const timers = ref([]);
  const { playSound } = useAudio();
  const { sendNotification } = useNotification();

  onMounted(() => {
    const style = document.createElement("style");
    style.textContent = `
      .timer-toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #3b82f6;
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        max-width: 300px;
        max-height: 140px;
        text-align: center;
      }
      .timer-toast.fade-out {
        animation: fadeOut 0.3s ease-out;
      }
      .timer-toast-button {
        background-color: white;
        color: #3b82f6;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      .timer-toast-button:hover {
        background-color: #f8fafc;
      }
    `;
    document.head.appendChild(style);
  });

  const showToast = (timer) => {
    const toast = document.createElement("div");
    toast.className = "timer-toast";

    const messageDiv = document.createElement("div");
    messageDiv.textContent = `Complete task: ${timer.name}`;

    const button = document.createElement("button");
    button.className = "timer-toast-button";
    button.textContent = "Done! Start again";

    button.onclick = () => {
      timer.remaining = timer.minutes * 60;
      startTimer(timer);

      toast.classList.add("fade-out");
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    };

    toast.appendChild(messageDiv);
    toast.appendChild(button);
    document.body.appendChild(toast);
  };

  const loadTimers = () => {
    const savedTimers = localStorage.getItem(STORAGE_KEY);
    if (savedTimers) {
      timers.value = JSON.parse(savedTimers);
    }
  };

  const addTimer = (name, minutes = 5) => {
    if (!name) return;

    const timer = {
      id: Date.now(),
      name,
      minutes,
      remaining: minutes * 60,
      intervalId: null,
      isRunning: false,
    };

    timers.value.push(timer);
    startTimer(timer);
  };

  const startTimer = (timer) => {
    if (timer.intervalId) return;

    timer.isRunning = true;
    timer.intervalId = setInterval(() => {
      timers.value = timers.value.map((t) => {
        if (t.id === timer.id) {
          return { ...t, remaining: t.remaining - 1 };
        }
        return t;
      });

      const currentTimer = timers.value.find((t) => t.id === timer.id);
      if (currentTimer.remaining <= 0) {
        pauseTimer(currentTimer);

        playSound();
        sendNotification(`Timer: ${currentTimer.name}`, {
          body: "Time is up!",
        });

        showToast(currentTimer);
      }
    }, 1000);
  };

  const pauseTimer = (timer) => {
    timer.isRunning = false;

    if (timer.intervalId) {
      clearInterval(timer.intervalId);
      timer.intervalId = null;
    }
  };

  const restartTimer = (timer) => {
    pauseTimer(timer);
    timer.remaining = timer.minutes * 60;
    startTimer(timer);
  };

  const deleteTimer = (timer) => {
    pauseTimer(timer);
    timers.value = timers.value.filter((t) => t.id !== timer.id);
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const format = (num) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${format(minutes)}:${format(seconds)}`;
    }

    return `${minutes}:${format(seconds)}`;
  };

  watch(
    timers,
    (newTimers) => {
      const timersToSave = newTimers.map((timer) => ({
        ...timer,
        intervalId: null,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timersToSave));
    },
    { deep: true }
  );

  return {
    timers,
    addTimer,
    startTimer,
    pauseTimer,
    restartTimer,
    deleteTimer,
    formatTime,
    loadTimers,
  };
}
