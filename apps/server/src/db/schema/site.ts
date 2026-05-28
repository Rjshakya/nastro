import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { v7 } from "uuid";
import { nanoid } from "nanoid";
import { themeTable } from "./theme";
import { templateTable } from "./template";
import { seoTable } from "./seo";

export const sites = pgTable(
  "site",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rootPageId: text().notNull(),
    slug: text().unique().notNull(),
    databaseId: text(),
    shortId: text("short_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid(13)),
    name: text("site_name").notNull(),
    setting: jsonb("site_setting"),
    //seo: text().references(() => seoTable.id),
    thumbnail: text("site_thumbnail_url)"),
    themeId: text().references(() => themeTable.id),
    templateId: text().references(() => templateTable.id),
    customCssLink: text("custom_css_link"),
    customScriptLink: text("custom_script_link"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("site_slug_idx").on(table.slug),
    index("site_pageId_idx").on(table.rootPageId),
  ],
);

export const sitesRelations = relations(sites, ({ one }) => ({
  user: one(user, {
    fields: [sites.userId],
    references: [user.id],
  }),
}));

export const sitesInsertSchema = createInsertSchema(sites);
export const sitesSelectSchema = createSelectSchema(sites);
export const sitesUpdateSchema = createUpdateSchema(sites);

export type SiteTableSelect = typeof sites.$inferSelect;
export type SiteTableInsert = typeof sites.$inferInsert;
