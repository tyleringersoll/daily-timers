import { describe, test, expect, beforeEach } from "vitest";
import { useSchedule } from "./useSchedule";

describe("useSchedule", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("isWithinSchedule returns correct boolean based on current time", () => {
    const { isWithinSchedule, scheduleStart, scheduleEnd } = useSchedule();

    vi.setSystemTime(new Date(2024, 1, 1, 10, 0));

    scheduleStart.value = "09:00";
    scheduleEnd.value = "17:00";

    expect(isWithinSchedule()).toBe(true);

    vi.setSystemTime(new Date(2024, 1, 1, 8, 0));
    expect(isWithinSchedule()).toBe(false);
  });
});
