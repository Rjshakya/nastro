import {
  table,
  title,
  email,
  select,
  people,
  InferInsertType,
  InferSelectType,
} from "@nastro/notion-orm";

export const membersTable = table("Members", {
  name: title(),
  email: email(),
  role: select({
    options: ["Developer", "Designer", "Manager", "Stakeholder"],
  }),
  lead: people(),
});

export type InsertMemberType = InferInsertType<typeof membersTable>;
export type SelectMemberType = InferSelectType<typeof membersTable>;
