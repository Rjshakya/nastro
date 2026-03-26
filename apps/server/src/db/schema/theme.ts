import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 } from "uuid";

export const themeTable = pgTable("theme", {
  id: text()
    .primaryKey()
    .$defaultFn(() => v7()),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  isPublic: boolean("is_public").default(false),
  themeSetting: jsonb("theme_setting"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const themeTableRelations = relations(themeTable, ({ one }) => ({
  user: one(user, {
    fields: [themeTable.createdBy],
    references: [user.id],
  }),
}));

export const themeTableInsertSchema = createInsertSchema(themeTable).omit({
  id: true,
});
export const themeTableSelectSchema = createSelectSchema(themeTable);

export type ThemeTableSelect = typeof themeTable.$inferSelect;
export type ThemeTableInsert = typeof themeTable.$inferInsert;
