import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sites = pgTable("site", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pageId: text(),
  databaseId: text(),
  shortId: text("short_id").notNull().unique(),
  siteName: text("site_name").notNull(),
  siteSetting: jsonb("site_setting"),
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

export const sitesInsertSchema = createInsertSchema(sites);
export const sitesSelectSchema = createSelectSchema(sites);
