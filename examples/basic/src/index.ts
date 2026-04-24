import { serve } from "@hono/node-server";
import { createNotionDB, eq } from "@nastro/notion-orm";
import { Hono } from "hono";
import { tasksTable } from "./schemas/tasks";
import { projectsTable } from "./schemas/projects";
import { loadEnvFile } from "node:process";
import { ContentfulStatusCode } from "hono/utils/http-status";
loadEnvFile();

const notionDb = createNotionDB({ token: process.env.NOTION_API_TOKEN as string });

const app = new Hono();

// ─── Health Check ───────────────────────────────────────────────────────────
app.get("/", (c) => c.text("Hello from nodejs - notion-orm"));

// ═════════════════════════════════════════════════════════════════════════════
// TASKS
// ═════════════════════════════════════════════════════════════════════════════

// List all tasks
app.get("/tasks", async (c) => {
  const { rows, nextCursor } = await notionDb.select().from(tasksTable).execute();
  return c.json({ tasks: rows, nextCursor });
});

// Get a single task by ID
app.get("/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const { rows } = await notionDb.select().from(tasksTable).where(eq("id", id)).execute();

  if (!rows.length) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json({ task: rows[0] });
});

// Create a new task
app.post("/tasks", async (c) => {
  try {
    const body = await c.req.json();
    const result = await notionDb.insert(tasksTable).values(body).execute();
    return c.json({ message: "Task created successfully!", task: result }, 201);
  } catch (error) {
    const e = error as { status: ContentfulStatusCode };
    console.error("Error creating task:", error);
    return c.json({ error: "Failed to create task", cause: error }, e.status ?? 500);
  }
});

// Update a task by ID
app.put("/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await notionDb.update(tasksTable).values(body).where(eq("id", id)).execute();
  return c.json({ message: "Task updated successfully!", task: result });
});

// Delete a task by ID
app.delete("/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const result = await notionDb.delete(tasksTable).where(eq("id", id)).execute();
  return c.json({ message: "Task deleted successfully!", result });
});

// ═════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═════════════════════════════════════════════════════════════════════════════

// List all projects
app.get("/projects", async (c) => {
  const { rows, nextCursor } = await notionDb.select().from(projectsTable).execute();
  return c.json({ projects: rows, nextCursor });
});

// Get a single project by ID
app.get("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const { rows } = await notionDb.select().from(projectsTable).where(eq("id", id)).execute();

  if (!rows.length) {
    return c.json({ error: "Project not found" }, 404);
  }
  return c.json({ project: rows[0] });
});

// Create a new project
app.post("/projects", async (c) => {
  const body = await c.req.json();
  const result = await notionDb.insert(projectsTable).values(body).execute();
  return c.json({ message: "Project created successfully!", project: result }, 201);
});

// Update a project by ID
app.put("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const result = await notionDb.update(projectsTable).values(body).where(eq("id", id)).execute();
  return c.json({ message: "Project updated successfully!", project: result });
});

// Delete a project by ID
app.delete("/projects/:id", async (c) => {
  const id = c.req.param("id");
  const result = await notionDb.delete(projectsTable).where(eq("id", id)).execute();
  return c.json({ message: "Project deleted successfully!", result });
});

serve({
  fetch: app.fetch,
}).on("connection", () => {
  console.log("A new connection has been established.");
});
