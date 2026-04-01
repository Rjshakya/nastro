import { LiveSite } from "#/components/site/live";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
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
    };
  },

  ssr: true,
  errorComponent: ({ error }) => (
    <Error message={error.message} onRetry={() => window.location.reload()} />
  ),
});

function RouteComponent() {
  return (
    <main>
      {/* <ClientOnly fallback={null}> */}
      <LiveSite />
      {/* </ClientOnly> */}
    </main>
  );
}
