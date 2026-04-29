import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";

import type { Site, SiteInsert } from "@/types/site";
import {
  getSites,
  createSite,
  getSite,
  updateSite,
  deleteSite,
  type CreateSiteInput,
  type GetSiteInput,
  getIsSiteSlugAvailable,
} from "@/lib/site";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "./use-debounce";

export const useSites = () => {
  const fetcher = () => getSites();

  const swr = useSWR("/sites", fetcher);

  return {
    data: swr.data?.data as unknown as Site[],
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useSite = (input: GetSiteInput) => {
  const fetcher = () => getSite(input);

  const swr = useSWR(input.slug ? `/sites/${input.rootPageId}` : null, fetcher);

  return {
    data: swr.data?.data,
    error: swr.error,
    isLoading: swr.isLoading,
    mutate: swr.mutate,
  };
};

export const useCreateSite = () => {
  const router = useRouter();
  const [input, setInput] = useState<SiteInsert>({
    userId: "",
    rootPageId: "",
    name: "",
    slug: "",
  });

  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    async (_key: string, { arg }: { arg: CreateSiteInput }) => {
      const site = await createSite(_key, { arg });
      router.invalidate({ sync: true });
      return site.data[0];
    },
  );

  return {
    createSite: trigger,
    isLoading: isMutating,
    error,
    reset,
    input,
    setInput,
  };
};

export const useUpdateSite = () => {
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    updateSite,
  );

  return {
    updateSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const useDeleteSite = () => {
  const router = useRouter();
  const { trigger, isMutating, error, reset } = useSWRMutation(
    "/sites",
    async (
      _key: string,
      { arg }: { arg: { siteId: string; pageId: string } },
    ) => {
      await deleteSite(_key, { arg });
      await router.invalidate({ sync: true });
    },
  );

  return {
    deleteSite: trigger,
    isLoading: isMutating,
    error,
    reset,
  };
};

export const BANNED_SUBDOMAINS = new Set([
  // ── Product & brand ──────────────────────────────────────
  "nastro",
  "nastro-app",
  "getnastro",
  "trynastro",

  // ── Core pages / marketing ───────────────────────────────
  "www",
  "app",
  "home",
  "landing",
  "site",
  "web",

  // ── Auth ─────────────────────────────────────────────────
  "auth",
  "login",
  "logout",
  "signin",
  "signup",
  "register",
  "sso",
  "oauth",
  "callback",
  "verify",
  "confirm",
  "reset",
  "forgot",
  "password",
  "2fa",
  "mfa",

  // ── Product sections ─────────────────────────────────────
  "dashboard",
  "admin",
  "console",
  "panel",
  "settings",
  "account",
  "profile",
  "billing",
  "checkout",
  "upgrade",
  "plans",
  "pricing",
  "onboarding",

  // ── Docs / legal / support ───────────────────────────────
  "docs",
  "documentation",
  "help",
  "support",
  "faq",
  "status",
  "roadmap",
  "changelog",
  "blog",
  "news",
  "press",
  "terms",
  "privacy",
  "legal",
  "security",
  "abuse",
  "dmca",

  // ── Infrastructure ───────────────────────────────────────
  "api",
  "cdn",
  "assets",
  "static",
  "media",
  "uploads",
  "files",
  "storage",
  "mail",
  "email",
  "smtp",
  "imap",
  "ns",
  "ns1",
  "ns2",
  "dns",
  "ftp",
  "sftp",
  "ssh",
  "vpn",
  "proxy",
  "gateway",

  // ── Internal / system ────────────────────────────────────
  "internal",
  "intranet",
  "dev",
  "develop",
  "development",
  "staging",
  "stage",
  "test",
  "testing",
  "sandbox",
  "preview",
  "beta",
  "alpha",
  "canary",
  "local",
  "localhost",

  // ── Common squatting targets ─────────────────────────────
  "about",
  "contact",
  "careers",
  "jobs",
  "team",
  "investors",
  "partners",
  "affiliate",
  "store",
  "shop",
  "pay",
  "payments",
]);

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function isValidSubdomainSlug(slug: string): boolean {
  const s = slug.trim();
  return s.length >= 3 && s.length <= 32 && SLUG_REGEX.test(s);
}

export const useIsSiteSlugAvailable = (slug: string) => {
  const fetcher = (v: string) => {
    if (!v || !v.length) {
      return Promise.resolve(false);
    }

    if (
      BANNED_SUBDOMAINS.has(v.toLowerCase().trim()) ||
      !isValidSubdomainSlug(v)
    ) {
      return Promise.resolve(false);
    }

    return getIsSiteSlugAvailable(v);
  };
  const { debouncedValue, value, setValue } = useDebounce(slug, 500);

  const [data, setData] = useState<{
    isAvailable: boolean;
    error: unknown;
    isLoading: boolean;
  }>({
    isAvailable: false,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    setData({ ...data, isLoading: true });

    let timer: NodeJS.Timeout | undefined;
    fetcher(debouncedValue as string)
      .then((v) => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(
          () =>
            setData((prev) => ({ ...prev, isAvailable: v, isLoading: false })),
          300,
        );
      })
      .catch((r) =>
        setData((prev) => ({ ...prev, error: r, isLoading: false })),
      );

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [debouncedValue]);

  return {
    isAvailable: data.isAvailable,
    error: data.error,
    isLoading: data.isLoading,
    value,
    setValue,
  };
};
