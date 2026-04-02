import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "#/components/landing/navbar";
import { HeroSection } from "#/components/landing/hero-section";
import { FeaturesGrid } from "#/components/landing/features-grid";
import { Pricing } from "#/components/landing/pricing";
import { Footer } from "#/components/landing/footer";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
