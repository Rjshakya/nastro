import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { user } from "./auth-schema";
import { sites } from "./site";

export const customDomainTable = t.pgTable("custom_domain", {
  id: t
    .uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  siteId: t
    .text()
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  cfId: t.text(),
  hostName: t.text().notNull(),
  status: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t.timestamp().defaultNow().notNull(),
});

export type customDomainTableInsert = InferInsertModel<
  typeof customDomainTable
>;
export type customDomainTableSelect = InferSelectModel<
  typeof customDomainTable
>;

export const customDomainInsertSchema = createInsertSchema(customDomainTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const customDomainSelectSchema = createSelectSchema(customDomainTable);
export const customDomainUpdateSchema = createUpdateSchema(customDomainTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
