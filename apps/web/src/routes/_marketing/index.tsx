import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "./-components/navbar";
import { HeroSection } from "./-components/hero-section";
import { WhyNastroSection } from "./-components/why-nastro-section";
import { FeaturesGrid } from "./-components/features-grid";
import { Pricing } from "./-components/pricing";
import { Footer } from "./-components/footer";

export const Route = createFileRoute("/_marketing/")({
  component: LandingPage,
});

function LandingPage() {
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
