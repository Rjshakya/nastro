import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 } from "uuid";
import { nanoid } from "nanoid";
import { themeTable } from "./theme";
import { templateTable } from "./template";

export const sites = pgTable("site", {
  id: text()
    .primaryKey()
    .$defaultFn(() => v7()),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pageId: text(),
  slug: text().unique().notNull(),
  databaseId: text(),
  shortId: text("short_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid(13)),
  siteName: text("site_name").notNull(),
  siteSetting: jsonb("site_setting"),
  themeId: text().references(() => themeTable.id),
  templateId: text().references(() => templateTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sitesRelations = relations(sites, ({ one }) => ({
  user: one(user, {
    fields: [sites.userId],
    references: [user.id],
  }),
}));

export const sitesInsertSchema = createInsertSchema(sites).omit({ id: true });
export const sitesSelectSchema = createSelectSchema(sites);

export type SiteSelect = typeof sites.$inferSelect;
export type SiteInsert = typeof sites.$inferInsert;
