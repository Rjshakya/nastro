import { LiveSite } from "#/components/site/live";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import { pageIdLoader } from "#/lib/pageId";
import { Error } from "#/components/error";

const siteSearchSchema = z.object({
  slug: z.string().optional(),
});

export const Route = createFileRoute("/$pageId")({
  validateSearch: siteSearchSchema,
  loaderDeps({ search: { slug } }) {
    return { slug };
  },
  loader: async ({ deps: { slug }, params: { pageId } }) =>
    pageIdLoader({ data: { pageId, slug: slug ?? "" } }),
  component: RouteComponent,
  head: ({ loaderData }) => {
    const scripts: Array<{
      type: "script";
      src?: string;
      children?: string;
      async?: boolean;
    }> = [];

    // Add Google Analytics script if tracking ID is present and valid
    const trackingId = loaderData?.site?.siteSetting?.analytics?.trackingId;
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
        { title: loaderData?.site.siteName },
        { property: "og:title", content: loaderData?.seo?.title },
        { property: "og:description", content: loaderData?.seo?.description },
        {
          property: "og:url",
          content: loaderData?.seo?.pageUrl,
        },
        {
          property: "og:image",
          content: loaderData?.seo?.ogImage,
        },
        { name: "twitter:title", content: loaderData?.seo?.title },
        { name: "twitter:description", content: loaderData?.seo?.description },
        {
          name: "twitter:url",
          content: loaderData?.seo?.pageUrl,
        },
        {
          name: "twitter:image",
          content: loaderData?.seo?.ogImage,
        },
      ],
      links: [
        {
          rel: loaderData?.css.fonts.primary?.rel,
          href: loaderData?.css.fonts.primary?.href,
        },
        {
          rel: loaderData?.css.fonts.secondary?.rel,
          href: loaderData?.css.fonts.secondary?.href,
        },
      ],
      scripts,
    };
  },
  errorComponent: ({ error }) => (
    <Error message={error.message} onRetry={() => window.location.reload()} />
  ),
  ssr: true,
});

function RouteComponent() {
  return (
    <main>
      <LiveSite />
    </main>
  );
}
