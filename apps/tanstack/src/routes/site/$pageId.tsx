import { getSite } from "#/lib/site";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "#/components/site/editor/site-editor";
import { loadFont } from "#/lib/fonts";
import { useNotionSettingsStore } from "#/stores/notion-settings";
import { getDefaultSettings } from "#/lib/settings-defaults";

const siteSearchSchema = z.object({
  slug: z.string(),
});

export const Route = createFileRoute("/site/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  component: RouteComponent,
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;
    const { data } = await getSite({ slug, pageId });
    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;
    // const seo = getNotionPageSeo({ page, site, pageId });
    const settings = site?.siteSetting;
    const defaultSettings = getDefaultSettings({
      existingSettings: settings || useNotionSettingsStore.getState().settings,
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
