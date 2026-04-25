import { table, title, richText, select, date, number, multiSelect, InferInsertType, InferSelectType } from "@nastro/notion-orm";

export const projectsTable = table("Projects", {
  name: title(),
  notes: richText(),
  status: select({
    options: ["Planning", "Active", "On Hold", "Completed"],
  }),
  budget: number(),
  tags: multiSelect({
    options: ["Frontend", "Backend", "Design", "Marketing"],
  }),
  startDate: date(),
  endDate: date(),
});



export type InsertProjectType = InferInsertType<typeof projectsTable>;
export type SelectProjectType = InferSelectType<typeof projectsTable>;