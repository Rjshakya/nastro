import { serve } from "@hono/node-server";
import { createNotionDB } from "@nastro/notion-orm";
import { Hono } from "hono";
import { tasksTable } from "./schemas/tasks";
import { loadEnvFile } from "node:process";
loadEnvFile();

const notionDb = createNotionDB({ token: process.env.NOTION_API_TOKEN as string });

const app = new Hono();
app
  .get("/", (c) => c.text("Hello from nodejs - notion-orm "))
  .get("/task", async (c) => {
    const { rows } = await (await notionDb.select()).from(tasksTable).execute();

    return c.json({
      message: "Hello, World!",
      tasks: rows,
    });
  })
  .post("/task", async (c) => {
    const { name, description, completed } = await c.req.json();
    const result = await (
      await notionDb.insert(tasksTable)
    )
      .values({
        name,
        description,
        completed,
        status: "In Progress",
      })
      .execute();

    return c.json({
      message: "Task created successfully!",
      task: result,
    });
  });

serve({
  fetch: app.fetch,
}).on("connection", () => {
  console.log("A new connection has been established.");
});
