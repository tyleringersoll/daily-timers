describe("Timer Application", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("creates and manages a timer", () => {
    // Click "Add New Timer" button first
    cy.contains("button", "Add New Timer").click();

    // Create new timer
    cy.get('input[placeholder="Timer name"]').type("Test Timer");
    cy.get('input[placeholder="Minutes (default 5)"]').type("1");
    cy.contains("button", "Add Timer").click();

    // Verify timer was created
    cy.contains("Test Timer").should("exist");
    cy.contains("1:00").should("exist");

    // Test timer controls
    cy.contains("button", "Pause").click();
    cy.contains("button", "Start").should("exist");

    cy.contains("button", "Restart").click();
    cy.contains("1:00").should("exist");

    cy.contains("button", "Delete").click();
    cy.contains("Test Timer").should("not.exist");
  });

  it("persists schedule changes", () => {
    // Click "Add New Timer" button to show schedule settings
    cy.contains("button", "Add New Timer").click();

    // Change schedule times
    cy.get('input[type="time"]').first().clear().type("10:00");
    cy.get('input[type="time"]').last().clear().type("16:00");

    // Hide form
    cy.contains("button", "Hide").click();

    // Reload page
    cy.reload();

    // Click "Add New Timer" again to show schedule settings
    cy.contains("button", "Add New Timer").click();

    // Verify persistence
    cy.get('input[type="time"]').first().should("have.value", "10:00");
    cy.get('input[type="time"]').last().should("have.value", "16:00");
  });

  it("creates and manages weekly tasks", () => {
    // Click "Add Daily Task" button
    cy.contains("button", "Add Daily Task").click();

    // Add a task
    cy.get("select").select("Monday");
    cy.get('input[placeholder="Enter task"]').type("Test Task");
    cy.contains("button", "Add Task").click();

    // Verify task was created and view all tasks
    cy.contains("Test Task").should("exist");
    cy.contains("button", "View All Tasks").click();

    // Wait for the Monday section to be visible
    cy.get('[data-testid="day-section-Monday"]') // Removed the ^ and -
      .should("be.visible")
      .within(() => {
        // Find the task row containing our text
        cy.get('[data-testid^="task-row-Monday-"]') // Moved to direct selector
          .should("be.visible")
          .within(() => {
            // Click Edit button in this specific task row
            cy.get('[data-testid^="edit-btn-Monday-"]').click();

            // Find and update the input
            cy.get('[data-testid^="edit-input-Monday-"]')
              .should("be.visible")
              .clear()
              .type("Updated Task");

            // Click Save
            cy.get('[data-testid^="save-btn-Monday-"]').click();

            // Verify the update
            cy.contains("Updated Task").should("exist");

            // Delete the task
            cy.get('[data-testid^="delete-btn-Monday-"]').click();
          });
      });

    // Verify task was deleted
    cy.contains("Updated Task").should("not.exist");
  });
});
