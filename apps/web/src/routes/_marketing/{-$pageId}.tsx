import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { customDomainSiteLoader, buildLiveSiteHead } from "@/lib/live-site";
import { LiveSiteContent } from "@/routes/_live_site/-components/live-site";
import { Navbar } from "./-components/navbar";
import { HeroSection } from "./-components/hero-section";
import { WhyNastroSection } from "./-components/why-nastro-section";
import { FeaturesGrid } from "./-components/features-grid";
import { Pricing } from "./-components/pricing";
import { Footer } from "./-components/footer";

const marketingSearchSchema = z.object({
  pageId: z.string().optional(),
});

export const Route = createFileRoute("/_marketing/{-$pageId}")({
  validateSearch: marketingSearchSchema,
  loader: async (data) => {
    const pageId = data?.params?.pageId;
    return await customDomainSiteLoader({ data: { pageId } });
  },
  head: ({ loaderData }) => {
    const header = buildLiveSiteHead(loaderData);

    return {
      meta: loaderData?.seo ? header?.meta : undefined,
      links: header?.links,
      scripts: header?.scripts,
      styles: header?.styles,
    };
  },
  component: LandingPage,
  ssr: true,
});

function LandingPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  if (data?.site) {
    const pageId = search.pageId || data.site.rootPageId;
    return (
      <LiveSiteContent
        data={data}
        pageId={pageId}
        slug={data.site.slug || ""}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhyNastroSection />
        <FeaturesGrid />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
