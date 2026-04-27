import { useState, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { parsePageId } from "notion-utils";
import { toast } from "sonner";

import { useTemplate } from "./use-templates";
import { useCreateSite } from "./use-sites";
import { getSite } from "@/lib/site";
import type { Site } from "@/types/site";
import { authClient } from "@/lib/auth-client";

interface UseTemplateInstallInput {
  templateId: string;
}

interface InstallTemplateInput {
  userNotionUrl: string;
  siteName: string;
  slug: string;
}

interface InstallTemplateState {
  userNotionUrl: string;
  siteName: string;
  slug: string;
  isSubmitting: boolean;
  error: string | null;
}

export const useTemplateInstall = ({ templateId }: UseTemplateInstallInput) => {
  const router = useRouter();
  const { data: template, isLoading: isLoadingTemplate } = useTemplate({
    templateId,
  });
  const { createSite, isLoading: isCreating } = useCreateSite();

  const [state, setState] = useState<InstallTemplateState>({
    userNotionUrl: "",
    siteName: template ? `${template.name}-new` : "",
    slug: "",
    isSubmitting: false,
    error: null,
  });

  // Update site name when template loads
  if (template && state.siteName === "" && !state.isSubmitting) {
    setState((prev) => ({
      ...prev,
      siteName: `${template.name}-new`,
    }));
  }

  const extractSlugFromUrl = useCallback((url: string): string | null => {
    try {
      const urlObj = new URL(url);

      // Check search params first
      const slugFromParams = urlObj.searchParams.get("slug");
      if (slugFromParams) return slugFromParams;

      // Otherwise extract from hostname
      const hostname = urlObj.hostname;
      const parts = hostname.split(".");
      if (parts.length >= 2) {
        return parts[0];
      }

      return null;
    } catch {
      return null;
    }
  }, []);

  const parsePageIdFromUrl = useCallback((url: string): string | undefined => {
    return parsePageId(url);
  }, []);

  const setUserNotionUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, userNotionUrl: url, error: null }));
  }, []);

  const setSiteName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, siteName: name, error: null }));
  }, []);

  const setSlug = useCallback((slug: string) => {
    setState((prev) => ({ ...prev, slug, error: null }));
  }, []);

  const installTemplate = useCallback(
    async ({ userNotionUrl, siteName, slug }: InstallTemplateInput) => {
      if (!template) {
        toast.error("Template not found");
        return null;
      }

      // Validate inputs
      if (!userNotionUrl.trim()) {
        setState((prev) => ({
          ...prev,
          error: "Please enter your Notion page URL",
        }));
        toast.error("Please enter your Notion page URL");
        return null;
      }

      if (!siteName.trim()) {
        setState((prev) => ({
          ...prev,
          error: "Please enter a site name",
        }));
        toast.error("Please enter a site name");
        return null;
      }

      if (!slug.trim()) {
        setState((prev) => ({ ...prev, error: "Please enter a site URL" }));
        toast.error("Please enter a site URL");
        return null;
      }

      setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        // 1. Parse page ID from user's URL
        const userPageId = parsePageIdFromUrl(userNotionUrl);
        if (!userPageId) {
          throw new Error(
            "Invalid Notion URL. Please make sure you've entered a valid Notion page link.",
          );
        }

        // 2. Extract source slug from template URL
        const sourceSlug = extractSlugFromUrl(template.url);
        if (!sourceSlug) {
          throw new Error(
            "Could not extract site information from template. Please try again later.",
          );
        }

        // Extract source page Id from template url
        const sourcePageId = parsePageIdFromUrl(template.url);

        if (!sourcePageId) {
          throw new Error(
            "Could not extract site information from template. Please try again later.",
          );
        }

        // 3. Get source site by slug (using existing getSite API)
        let sourceSite: Site | null = null;
        try {
          const sitesResponse = await getSite({
            slug: sourceSlug,
            rootPageId: sourcePageId,
          });
          sourceSite = sitesResponse.data.site;
        } catch (siteError) {
          console.error("Failed to fetch source site:", siteError);
        }

        // 4. Get current user
        const { data: session } = await authClient.getSession();
        const userId = session?.session?.userId;
        if (!userId) {
          throw new Error("You must be logged in to install a template");
        }

        // 5. Create new site with template settings
        const result = await createSite({
          userId,
          rootPageId: userPageId,
          slug: slug,
          name: siteName,
          setting: sourceSite?.setting ?? undefined,
        });

        if (result) {
          toast.success("Site created successfully from template!");
          router.navigate({ to: "/dashboard" });
          return result;
        }

        return null;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to install template";
        setState((prev) => ({ ...prev, error: errorMessage }));
        toast.error(errorMessage);
        return null;
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [template, extractSlugFromUrl, parsePageIdFromUrl, createSite, router],
  );

  return {
    template,
    isLoadingTemplate,
    state,
    setUserNotionUrl,
    setSiteName,
    setSlug,
    installTemplate,
    isSubmitting: state.isSubmitting || isCreating,
    error: state.error,
  };
};
