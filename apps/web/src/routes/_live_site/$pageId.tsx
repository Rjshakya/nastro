import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  handleLiveSiteHtmlLinks,
  handleLiveSiteStyles,
  liveSiteLoader,
} from "@/lib/live-site";
import { LiveSite } from "./-components/live-site";
import { Error } from "@/components/error";
import { getFontUrl, type GoogleFont } from "@/lib/fonts";
import { computeStyles } from "@/lib/compute-styles";
import type { SiteSetting } from "@/types/site.setting";
import { getDefaultSettings } from "@/lib/default-settings";

const siteSearchSchema = z.object({
  slug: z.string().optional(),
});

export const Route = createFileRoute("/_live_site/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ params, deps }) => {
    const { pageId } = params;
    const { slug } = deps;
    return await liveSiteLoader({ data: { pageId, slug } });
  },
  component: LiveSitePage,
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const site = loaderData?.site;
    const typography = site?.setting?.typography;

    const scripts: Array<{
      type: "script";
      src?: string;
      children?: string;
      async?: boolean;
    }> = [];

    const trackingId = site?.setting?.analytics?.trackingId;
    const GA4_REGEX = /^G-[A-Z0-9]{10}$/;

    if (trackingId && GA4_REGEX.test(trackingId)) {
      scripts.push(
        {
          type: "script",
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${trackingId}');
          `,
        },
        {
          type: "script",
          src: `https://www.googletagmanager.com/gtag/js?id=${trackingId}`,
          async: true,
        },
      );
    }

    if (site?.customScriptLink) {
      scripts.push({
        type: "script",
        src: site.customScriptLink,
      });
    }

    const links = handleLiveSiteHtmlLinks(site);

    const cssVariables = handleLiveSiteStyles(site);

    return {
      meta: [
        { title: seo?.title || site?.name || "Nastro" },
        { property: "og:title", content: seo?.title },
        { property: "og:description", content: seo?.description },
        { property: "og:url", content: seo?.pageUrl },
        { property: "og:image", content: seo?.ogImage },
        { name: "twitter:title", content: seo?.title },
        { name: "twitter:description", content: seo?.description },
        { name: "twitter:url", content: seo?.pageUrl },
        { name: "twitter:image", content: seo?.ogImage },
      ],
      scripts,
      links,
      styles: [
        {
          children: `

    
           .notion {

              --primary-font:${typography?.font?.primary};
                           

              ${cssVariables}
        

              .notion-page-icon-hero.notion-page-icon-image {
                width: 100%;
                height: fit-content;
                margin-left: 0;
                display: flex;
                justify-content: start;
                padding-inline: 16px;
              }

              .notion-page-icon-hero.notion-page-icon-image .notion-page-icon {
                    width: 124px;
                    height: 124px;
              }
          }

        

      `,
        },
      ],
    };
  },

  ssr: true,
  errorComponent: Error,
});

function LiveSitePage() {
  return (
    <>
      <LiveSite />
    </>
  );
}
