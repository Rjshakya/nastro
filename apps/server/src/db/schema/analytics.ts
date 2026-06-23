import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const visitors = pgTable(
  "visitor",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => v7()),
    uniqueId: text("unique_id").notNull(),
    startAt: timestamp("start_at").defaultNow().notNull(),
    leaveAt: timestamp("leave_at"),
    pageId: text("page_id").notNull(),
    slug: text().notNull(),
    ip: text().notNull(),
    userAgent: text("user_agent").notNull(),
    country: text(),
    city: text(),
    lat: text(),
    long: text(),
    source: text(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("visitor_uniqueId_idx").on(t.uniqueId),
    index("visitor_pageId_idx").on(t.pageId),
    index("visitor_slug_idx").on(t.slug),
    index("visitor_createdAt_idx").on(t.createdAt),
    index("visitor_country_idx").on(t.country),
  ],
);

export type VisitorTableSelect = typeof visitors.$inferSelect;
export type VisitorTableInsert = typeof visitors.$inferInsert;
