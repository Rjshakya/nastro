import type { Theme } from "@/types/theme";
import type { ThemeSetting } from "@/types/theme";
import { client } from "./api-client";

interface GetThemeInput {
  themeId: string;
}

export interface CreateThemeInput {
  name: string;
  setting?: ThemeSetting;
  isPublic?: boolean;
}

export interface UpdateThemeInput {
  name?: string;
  setting?: ThemeSetting;
  isPublic?: boolean;
}

export const getAllThemes = async ({ limit, prev }: { limit: number; prev?: Date }) => {
  const res = await client.api.theme.$get({
    query: {
      limit: limit.toString(),
      prev: prev?.toISOString(),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("failed to fetch themes");
  }

  const json = await res.json();
  return json.data as unknown as {
    result: Theme[];
    prevToken?: string;
  };
};

export const getTheme = async (input: GetThemeInput) => {
  const res = await client.api.theme[":id"].$get({
    param: { id: input.themeId },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("failed to fetch theme");
  }

  const json = await res.json();
  return json.data as unknown as Theme;
};

export const createTheme = async (_key: string, { arg }: { arg: CreateThemeInput }) => {
  const res = await client.api.theme.$post({
    json: arg,
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to create theme");
  }

  return res.json();
};

export const updateTheme = async (
  _key: string,
  { arg }: { arg: { themeId: string; input: UpdateThemeInput } },
) => {
  const res = await client.api.theme[":id"].$patch({
    param: { id: arg.themeId },
    json: arg.input,
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to update theme");
  }

  return res.json();
};

export const deleteTheme = async (_key: string, { arg }: { arg: { themeId: string } }) => {
  const res = await client.api.theme[":id"].$delete({
    param: { id: arg.themeId },
  });

  if (!res.ok) {
    const error = await res.json();
    console.log(error);
    throw new Error("Failed to delete theme");
  }

  return res.json();
};
