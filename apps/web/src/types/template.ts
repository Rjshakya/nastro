import type { TemplateTableInsert, TemplateTableSelect } from "server/domain";

export type Template = Omit<TemplateTableSelect, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type TemplateInsert = TemplateTableInsert;
