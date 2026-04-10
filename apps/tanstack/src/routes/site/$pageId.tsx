import { getSite } from "#/lib/site";
import type { Site } from "#/types/site";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { ExtendedRecordMap } from "notion-types";
import { SiteEditor } from "#/components/site/editor/site-editor";
import { SiteEditorLoading } from "#/components/site/editor/site-editor-loading";

import { useNotionSettingsStore } from "#/stores/notion-settings";
import { getDefaultSettings } from "#/lib/settings-defaults";

const siteSearchSchema = z.object({
  slug: z.string(),
  themeId: z.string().optional(),
});

export const Route = createFileRoute("/site/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug, themeId } }) {
    return { slug, themeId };
  },
  component: RouteComponent,
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;

    const { data } = await getSite({ slug, pageId });

    const site = data?.site as Site;
    const page = data?.page as ExtendedRecordMap;

    const settings = site?.siteSetting;
    const defaultSettings = getDefaultSettings({
      existingSettings: settings || useNotionSettingsStore.getState().settings,
      page,
      pageId,
      site,
    });

    return { site, page, seo: defaultSettings.seo, settings: defaultSettings };
  },
  pendingComponent: SiteEditorLoading,
});

function RouteComponent() {
  return <SiteEditor />;
}
