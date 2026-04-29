import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { liveSiteLoader } from "@/lib/live-site";
import { LiveSite } from "./-components/live-site";

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
    };
  },

  ssr: true,
});

function LiveSitePage() {
  return <LiveSite />;
}
