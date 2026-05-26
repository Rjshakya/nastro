import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "@tanstack/react-router";

import type { CreateApiKeyInput, UpdateApiKeyInput } from "@/types/apikey";
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from "@/lib/apikey";

export const API_KEYS_KEY = "/apikeys";

export const useApiKeys = () => {
  const fetcher = () => getApiKeys();

  const swr = useSWR(API_KEYS_KEY, fetcher);

  return {
    data: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateApiKey = () => {
  const router = useRouter();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    API_KEYS_KEY,
    async (_key: string, { arg }: { arg: CreateApiKeyInput }) => {
      const result = await createApiKey(_key, { arg });
      router.invalidate({ sync: true });
      return result;
    },
  );

  return {
    createApiKey: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useUpdateApiKey = () => {
  const router = useRouter();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    API_KEYS_KEY,
    async (
      _key: string,
      { arg }: { arg: { keyId: string; input: UpdateApiKeyInput } },
    ) => {
      const result = await updateApiKey({ keyId: arg.keyId, input: arg.input });
      await mutate(API_KEYS_KEY);
      await router.invalidate({ sync: true });
      return result;
    },
  );

  return {
    updateApiKey: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteApiKey = () => {
  const router = useRouter();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    API_KEYS_KEY,
    async (_key: string, { arg }: { arg: { keyId: string } }) => {
      const result = await deleteApiKey(_key, { arg });
      await router.invalidate({ sync: true });
      return result;
    },
  );

  return {
    deleteApiKey: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};
