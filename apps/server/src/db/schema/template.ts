import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { v7 } from "uuid";

export const templateTable = pgTable("template", {
  id: text()
    .primaryKey()
    .$defaultFn(() => v7()),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  templateName: text("template_name").notNull(),
  templateUrl: text("template_url").notNull(),
  templateThumbnailUrl: text("template_thumbnail_url"),
  templateDescription: text("template_description"),
  instructionsPageUrl: text("instructions_page_url"),
  notionPageUrl: text("notion_page_url").notNull(),
  isPaid: boolean("is_paid").default(false),
  paymentLink: text("template_payment_link"),
  price: integer(),
  tags: jsonb().$type<string[]>(),
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
