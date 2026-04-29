import type { Template, TemplateInsert } from "@/types/template";
import { client } from "./api-client";

interface GetTemplateInput {
  templateId: string;
}

export interface CreateTemplateInput {
  name: string;
  url: string;
  thumbnail: string;
  description: string | null;
  instructionsPageUrl: string | null;
  notionPageUrl: string;
  isPaid: boolean | null;
  paymentLink: string | null;
  price: number | null;
  tags: string[] | null;
}

export interface UpdateTemplateInput {
  name: string;
  url: string;
  description: string | null;
  instructionsPageUrl: string | null;
  thumbnail: string;
  notionPageUrl: string;
  isPaid: boolean | null;
  paymentLink: string | null;
  price: number | null;
  tags: string[] | null;
}

export const getAllTemplates = async ({ limit, prev }: { limit: number; prev?: Date }) => {
  const res = await client.api.template.$get({
    query: {
      limit: limit.toString(),
      prev: prev?.toISOString(),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("failed to fetch templates");
  }

  const json = await res.json();
  return json.data as {
    result: Template[];
    prevToken?: string;
  };
};

export const getTemplate = async (input: GetTemplateInput) => {
  const res = await client.api.template[":id"].$get({
    param: { id: input.templateId },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("failed to fetch template");
  }

  const json = await res.json();
  return json.data as Template;
};

export const createTemplate = async (_key: string, { arg }: { arg: TemplateInsert }) => {
  const res = await client.api.template.$post({
    json: arg,
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to create template");
  }

  return res.json();
};

export const updateTemplate = async (
  _key: string,
  { arg }: { arg: { templateId: string; input: UpdateTemplateInput } },
) => {
  const res = await client.api.template[":id"].$patch({
    param: { id: arg.templateId },
    json: arg.input,
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to update template");
  }

  return res.json();
};

export const deleteTemplate = async (_key: string, { arg }: { arg: { templateId: string } }) => {
  const res = await client.api.template[":id"].$delete({
    param: { id: arg.templateId },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to delete template");
  }

  return res.json();
};
