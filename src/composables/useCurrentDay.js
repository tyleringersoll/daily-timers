import { ref, onMounted } from "vue";
import { DAYS_OF_WEEK } from "../constants";

export function useCurrentDay() {
  const getCurrentDay = () => {
    const today = new Date().getDay();
    return DAYS_OF_WEEK[today === 0 ? 6 : today - 1];
  };

  const currentDay = ref(getCurrentDay());

  onMounted(() => {
    const updateCurrentDay = () => {
      currentDay.value = getCurrentDay();
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - now;

    setTimeout(() => {
      updateCurrentDay();
      setInterval(updateCurrentDay, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  });

  return {
    currentDay,
  };
}
