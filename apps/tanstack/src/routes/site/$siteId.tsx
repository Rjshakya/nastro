import { getSite } from "#/lib/site";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "#/components/site/editor/site-editor";
import { loadFont } from "#/lib/fonts";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { applyDefaultSettings } from "#/lib/settings-defaults";

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
    // const seo = getNotionPageSeo({ page, site, pageId });
    const settings = site?.siteSetting;
    const defaultSettings = applyDefaultSettings({
      existingSettings: settings,
      page,
      pageId,
      site,
    });

    useNotionSettingsStore.getState().updateSettings({
      ...defaultSettings,
    });

    if (settings?.typography?.fonts) {
      Promise.all([
        loadFont(settings?.typography?.fonts?.primary as string),
        loadFont(settings?.typography?.fonts?.secondary as string),
      ]);
    }
    return { site, page, seo: defaultSettings.seo };
  },
});

function RouteComponent() {
  return <SiteEditor />;
}
