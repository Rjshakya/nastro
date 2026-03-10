import { getSite } from "#/lib/site";
import type { Site } from "#/types/site";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "#/components/site/editor/site-editor";
import {
  computeCustomStyles,
  useNotionCustomizationStore,
} from "#/stores/notion-customization-store";
import { loadFont } from "#/lib/fonts";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import {
  getNotionPageIcon,
  getNotionPageSeo,
  getNotionPageTitle,
} from "#/lib/utils";

const siteSearchSchema = z.object({
  pageId: z.string(),
});

export const Route = createFileRoute("/site/$siteId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { pageId } }) {
    return { pageId };
  },
  component: RouteComponent,
  loader: async ({ params, deps }) => {
    const { siteId } = params;
    const { pageId } = deps;
    const { data } = await getSite({ siteId, pageId });
    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;
    const seo = getNotionPageSeo({ page, site, pageId });
    const settings = site?.siteSetting;
    const defaultPageIcon = getNotionPageIcon(page, pageId);
    const defaultPageTitle = getNotionPageTitle(page);
    useNotionSettingsStore.getState().updateSettings({
      ...useNotionSettingsStore.getState().settings,
      ...settings,
      seo,
      general: {
        ...settings?.general,
        pageWidth: settings?.general?.pageWidth || 65,
      },
      layout: {
        ...settings?.layout,
        header: settings?.layout?.header || {
          text: defaultPageTitle || "",
          logo: defaultPageIcon || "",
          width: 100,
        },
        footer: settings?.layout?.footer || {
          text: defaultPageTitle || "",
          logo: defaultPageIcon || "",
          width: 100,
        },
      },
    });

    if (settings?.typography?.fonts) {
      Promise.all([
        loadFont(settings?.typography?.fonts?.primary as string),
        loadFont(settings?.typography?.fonts?.secondary as string),
      ]);
    }
    return { site, page, seo };
  },
});

function RouteComponent() {
  return <SiteEditor />;
}
