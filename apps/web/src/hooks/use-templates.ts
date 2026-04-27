import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import type { Template } from "@/types/template";
import {
  getAllTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from "@/lib/site.template";
import { useRouter } from "@tanstack/react-router";

export const useTemplates = () => {
  const fetcher = () => getAllTemplates({ limit: 100 });

  const swr = useSWR("/templates", fetcher);

  return {
    data: swr.data?.result as Template[],
    prevToken: swr.data?.prevToken,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

interface GetTemplateInput {
  templateId: string;
}

export const useTemplate = (input: GetTemplateInput) => {
  const fetcher = () => getTemplate(input);

  const swr = useSWR(
    input.templateId ? `/templates/${input.templateId}` : null,
    fetcher,
  );

  return {
    data: swr.data as Template,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateTemplate = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/templates",
    async (_key: string, { arg }: { arg: CreateTemplateInput }) => {
      const template = await createTemplate(_key, { arg });
      router.invalidate({ sync: true });
      return template.data;
    },
  );

  return {
    createTemplate: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useUpdateTemplate = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/templates",
    async (
      _key: string,
      {
        arg,
      }: {
        arg: {
          templateId: string;
          input: UpdateTemplateInput;
        };
      },
    ) => {
      const template = await updateTemplate(_key, { arg });
      await router.invalidate({ sync: true });
      return template.data;
    },
  );

  return {
    updateTemplate: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteTemplate = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/templates",
    async (_key: string, { arg }: { arg: { templateId: string } }) => {
      await deleteTemplate(_key, { arg });
      await router.invalidate({ sync: true });
    },
  );

  return {
    deleteTemplate: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};
