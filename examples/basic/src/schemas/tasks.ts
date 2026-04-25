import {
  table,
  title,
  richText,
  select,
  date,
  checkbox,
  InferInsertType,
  InferSelectType,
} from "@nastro/notion-orm";

export const tasksTable = table("Tasks", {
  name: title(),
  description: richText(),
  status: select({
    options: ["To Do", "In Progress", "In Review", "Done"],
  }),
  priority: select({
    options: ["Low", "Medium", "High", "Urgent"],
  }),
  dueDate: date(),
  completed: checkbox(),
});

export type InsertTaskType = InferInsertType<typeof tasksTable>;
export type SelectTaskType = InferSelectType<typeof tasksTable>;
