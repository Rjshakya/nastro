import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 } from "uuid";
import { nanoid } from "nanoid";

export const templateTable = pgTable("template", {
  id: text()
    .primaryKey()
    .$defaultFn(() => v7()),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pageId: text("page_id").notNull(),
  slug: text().unique().notNull(),
  databaseId: text("database_id"),
  shortId: text("short_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(13)),

  templateName: text("template_name").notNull(),
  templateSetting: jsonb("template_setting"),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const templateTableRelations = relations(templateTable, ({ one }) => ({
  user: one(user, {
    fields: [templateTable.createdBy],
    references: [user.id],
  }),
}));

export const templateTableInsetSchema = createInsertSchema(templateTable).omit({
  id: true,
});
export const templateTableSelectSchema = createSelectSchema(templateTable);

export type TemplateTableSelect = typeof templateTable.$inferSelect;
export type TemplateTableInsert = typeof templateTable.$inferInsert;
