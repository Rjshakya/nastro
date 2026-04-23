import { table, title, richText, select, date } from "@nastro/notion-orm";

export const projectsTable = table("Projects", {
  name: title(),
  description: richText(),
  status: select({
    options: ["Planning", "Active", "On Hold", "Completed"],
  }),
  startDate: date(),
  endDate: date(),
});
