import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import WeeklyTaskList from "./WeeklyTaskList.vue";
import { DAYS_OF_WEEK } from "../constants";

function makeTasks() {
  return {
    Monday: [
      { id: "1", text: "Task 1", repeating: false },
      { id: "2", text: "Task 2", repeating: true },
    ],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
}

function makeCompletion() {
  return {
    Monday: { 1: false, 2: true },
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  };
}

describe("WeeklyTaskList", () => {
  it("renders current day tasks in daily view", () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
      global: {
        mocks: {
          $currentDay: "Monday",
        },
      },
    });
    expect(wrapper.text()).toContain("Task 1");
    expect(wrapper.text()).toContain("Task 2");
    expect(wrapper.text()).not.toContain("Edit");
    expect(wrapper.text()).not.toContain("Delete");
  });

  it("toggles to all weekly tasks view and shows Edit/Delete", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("All Weekly Tasks");
    expect(wrapper.text()).toContain("Edit");
    expect(wrapper.text()).toContain("Delete");
  });

  it("emits toggle-task when checkbox is clicked", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(true);
    expect(wrapper.emitted("toggle-task")).toBeTruthy();
  });

  it("renders all days in weekly view", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    await wrapper.find("button").trigger("click");
    for (const day of DAYS_OF_WEEK) {
      expect(wrapper.text()).toContain(day);
    }
  });

  it("shows input and emits edit-task when editing and saving", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });

    await wrapper.find("button").trigger("click");

    const editBtn = wrapper.find('[data-testid="edit-btn-Monday-1"]');
    expect(editBtn.exists()).toBe(true);

    await editBtn.trigger("click");
    await wrapper.vm.$nextTick();

    const input = wrapper.find('[data-testid="edit-input-Monday-1"]');
    expect(input.exists()).toBe(true);

    await input.setValue("Updated Task");
    const saveBtn = wrapper.find('[data-testid="save-btn-Monday-1"]');
    await saveBtn.trigger("click");

    expect(wrapper.emitted("edit-task")).toBeTruthy();
    expect(wrapper.emitted("edit-task")[0][0].newText).toBe("Updated Task");
  });

  it("shows 'repeating' badge for repeating tasks in all tasks view", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.html()).toContain("repeating");
  });

  it("shows 'No tasks' message for empty days in all tasks view", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("No tasks for Tuesday");
  });

  it("emits remove-task when Delete is clicked", async () => {
    const wrapper = mount(WeeklyTaskList, {
      props: {
        weeklyTasks: makeTasks(),
        taskCompletion: makeCompletion(),
      },
    });
    await wrapper.find("button").trigger("click");
    const deleteBtn = wrapper
      .findAll("button")
      .find((b) => b.text() === "Delete");
    await deleteBtn.trigger("click");
    expect(wrapper.emitted("remove-task")).toBeTruthy();
  });
});
