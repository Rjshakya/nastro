import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const sites = t.pgTable("site", {
  id: t.text().primaryKey(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pageId: t.text(),
  databaseId: t.text(),
  shorId: t.text().notNull().unique(),
  siteSetting: t.jsonb("site_setting"),
  createdAt: t.timestamp("created_at").defaultNow().notNull(),
  updatedAt: t
    .timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
