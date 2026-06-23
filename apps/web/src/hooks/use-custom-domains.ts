import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { useRouter } from "@tanstack/react-router";

import type { CreateCustomDomainPayload } from "@/types/custom-domain";
import {
  getCustomDomains,
  getDomainStatus,
  getDomainCname,
  createCustomDomain,
  deleteCustomDomain,
} from "@/lib/custom-domain";

export const CUSTOM_DOMAINS_KEY = "/custom-domains";
export const DOMAIN_STATUS_KEY = (id: string) => `/custom-domain-status/${id}`;
export const DOMAIN_CNAME_KEY = "/custom-domain-cname";

export const useCustomDomains = () => {
  const fetcher = () => getCustomDomains();
  const swr = useSWR(CUSTOM_DOMAINS_KEY, fetcher);

  return {
    domains: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useDomainStatus = (id: string | null) => {
  const fetcher = (key: string) => getDomainStatus(key.split("/").pop()!);
  const swr = useSWR(id ? DOMAIN_STATUS_KEY(id) : null, fetcher, {
    refreshInterval: (data) => {
      if (!data || !data.status) return 0;
      const status = data.status;

      if (
        status === "deleted" ||
        status === "active" ||
        status === "blocked" ||
        status === "moved"
      ) {
        return 0;
      }

      return 10000;
    },
    errorRetryCount: 1,
  });

  return {
    status: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useDomainCname = () => {
  const fetcher = () => getDomainCname();
  const swr = useSWR(DOMAIN_CNAME_KEY, fetcher);

  return {
    cname: swr.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateCustomDomain = () => {
  const router = useRouter();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    CUSTOM_DOMAINS_KEY,
    async (_key: string, { arg }: { arg: CreateCustomDomainPayload }) => {
      const result = await createCustomDomain(_key, { arg });
      await mutate(CUSTOM_DOMAINS_KEY);
      await router.invalidate({ sync: true });
      return result;
    },
  );

  return {
    createCustomDomain: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteCustomDomain = () => {
  const router = useRouter();

  const { trigger, isMutating, error, reset } = useSWRMutation(
    CUSTOM_DOMAINS_KEY,
    async (_key: string, { arg }: { arg: { id: string } }) => {
      const result = await deleteCustomDomain(_key, { arg });
      await mutate(CUSTOM_DOMAINS_KEY);
      await mutate(DOMAIN_STATUS_KEY(arg.id), null, false);
      await router.invalidate({ sync: true });
      return result;
    },
  );

  return {
    deleteCustomDomain: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};
