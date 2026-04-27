import type { TemplateTableSelect } from "server/domain";

export type Template = Omit<TemplateTableSelect, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};
