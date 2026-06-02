import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { v7 } from "uuid";

export const seoTable = pgTable(
  "seo",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    pageId: text().notNull(),
    title: text().notNull(),
    description: text(),
    ogImageLink: text(),
    pageUrl: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("seo_table_pageId_idx").on(t.pageId),
    index("seo_table_userId_idx").on(t.userId),
  ],
);

export const seoTableInsertSchema = createInsertSchema(seoTable);
export const seoTableSelectSchema = createSelectSchema(seoTable);
export const seoTableUpdateSchema = createUpdateSchema(seoTable);

export type SeoTableSelect = typeof seoTable.$inferSelect;
export type SeoTableInsert = typeof seoTable.$inferInsert;
