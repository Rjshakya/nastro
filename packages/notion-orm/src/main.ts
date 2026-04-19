// Notion-ORM Schema Definition Demo
// This file demonstrates all available column types

import * as n from "./core/index.ts";

// ============== Example: Tasks Table ==============

const tasksTable = n.table("Tasks", {
  // Required: exactly one title property
  title: n.title(),

  // Status with custom options
  status: n.status({
    options: ["Backlog", "Todo", "In Progress", "In Review", "Done"],
  }),

  // Priority with custom options
  priority: n.select({
    options: [
      { name: "Low", color: "gray" },
      { name: "Medium", color: "yellow" },
      { name: "High", color: "red" },
    ],
  }),

  // Tags with simple string options (colors auto-assigned)
  tags: n.multiSelect({ options: ["Bug", "Feature", "Documentation", "Tech Debt"] }),

  // Due date
  dueDate: n.date(),

  // Estimated hours
  estimatedHours: n.number(),

  // Assigned to
  assignee: n.people(),

  // Is completed
  completed: n.checkbox(),

  // Description
  description: n.richText(),

  // Project relation (will be resolved during push)
  project: n.relation({
    name: "Project",
    relatedTo: "projectsTable", // References the projectsTable export
  }),

  // System properties
  createdAt: n.createdTime(),
  updatedAt: n.lastEditedTime(),
});

// ============== Example: Projects Table ==============

const projectsTable = n.table("Projects", {
  // Title
  name: n.title({ name: "Project Name" }),

  // Status
  status: n.status({
    name: "Status",
    options: [
      { name: "pending", color: "gray" },
      { name: "done", color: "green" },
    ],
  }),

  // Category
  category: n.select({
    name: "Category",
    options: [
      { name: "Web", color: "blue" },
      { name: "Mobile", color: "brown" },
      { name: "Desktop", color: "default" },
      { name: "API", color: "green" },
    ],
  }),

  // Budget in dollars
  budget: n.number({
    name: "Budget",
    format: "dollar",
  }),

  // Progress percentage
  progress: n.number({
    name: "Progress",
    format: "percent",
  }),

  // Website URL
  website: n.url({ name: "Website" }),

  // Contact email
  contactEmail: n.email({ name: "Contact Email" }),

  // Phone number
  phone: n.phoneNumber({ name: "Phone" }),

  // Files and attachments
  documents: n.files({ name: "Documents" }),

  // Team members
  team: n.people({ name: "Team" }),

  // Is active
  isActive: n.checkbox({ name: "Is Active" }),

  // Start and end dates
  startDate: n.date({ name: "Start Date" }),
  endDate: n.date({ name: "End Date" }),

  // Relation to tasks
  tasks: n.relation({
    name: "Tasks",
    relatedTo: "tasksTable",
  }),

  // Formula: days until deadline
  daysUntilDeadline: n.formula({
    name: "Days Until Deadline",
    expression: 'dateBetween(prop("End Date"), now(), "days")',
  }),

  // Rollup: count of tasks
  taskCount: n.rollup({
    name: "Task Count",
    relationProperty: "Tasks",
    rollupProperty: "id",
    function: "count",
  }),

  // Rollup: completion percentage
  completionRate: n.rollup({
    name: "Completion Rate",
    relationProperty: "Tasks",
    rollupProperty: "Completed",
    function: "percent_checked",
  }),

  // Unique ID with prefix
  projectId: n.uniqueId({
    name: "Project ID",
    prefix: "PROJ",
  }),

  // Description
  description: n.richText({ name: "Description" }),

  // System properties
  createdAt: n.createdTime({ name: "Created" }),
  createdBy: n.createdBy({ name: "Created By" }),
  updatedAt: n.lastEditedTime({ name: "Last Updated" }),
  updatedBy: n.lastEditedBy({ name: "Last Updated By" }),
});
