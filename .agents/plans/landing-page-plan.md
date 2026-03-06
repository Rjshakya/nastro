# Nastro Landing Page - Complete Implementation Plan

## Executive Summary

**Product:** Nastro - Turn Notion pages into beautiful websites  
**Target Audiences:**

1. **Creators** - Marketers, solo builders, content creators wanting online presence
2. **Developers** - Want to use Notion as a headless CMS via API  
   **Design Philosophy:** Clean, minimal, bento grid layouts, polished animations  
   **Current State:** Empty index.astro (just dashboard link)  
   **Goal:** High-converting landing page with clear value proposition

---

## 1. Product Architecture Deep Dive

### 1.1 Core Value Propositions

**For Creators:**

- Content stays in Notion (familiar workflow)
- Custom domains & branding
- Built-in analytics
- Zero-code website building
- Fast, SEO-optimized sites

**For Developers:**

- Notion as headless CMS
- RESTful API for content
- JSON responses
- Webhook support (future)
- TypeScript SDK (future)

### 1.2 Technical Foundation

**Frontend (Astro + React):**

- Static site generation for performance
- React components for interactivity
- Tailwind CSS v4 with OKLCH colors
- shadcn/ui component library (30+ components ready)

**Backend (Hono + Cloudflare):**

- Edge-deployed API
- Drizzle ORM + PostgreSQL
- Type-safe Hono RPC
- better-auth for authentication

**Notion Integration:**

- Real-time page rendering via react-notion-x
- OAuth workspace connection
- Page customization system (colors, fonts, layout)

### 1.3 Existing Assets to Leverage

**Available Components:**

- Button, Card, Badge (hero CTAs)
- Tabs (creator vs developer toggle)
- Accordion (FAQ)
- Carousel (testimonials - if needed)
- Slider (feature demos)

**Design System:**

- Colors: OKLCH-based with CSS variables
- Typography: Geist Sans + Geist Mono
- Spacing: Tailwind v4 scale
- Border radius: --radius variable (0.625rem)

---

## 2. Landing Page Structure

### 2.1 Page Sections (Top to Bottom)

```
1. Navigation (sticky, blur backdrop)
2. Hero Section (bento grid layout)
3. Social Proof (logo cloud / testimonials)
4. Features Grid (bento cards)
5. How It Works (3-step process)
6. Use Cases (Creators vs Developers tabs)
7. Pricing (simple 2-tier)
8. FAQ (accordion)
9. Final CTA
10. Footer
```

### 2.2 File Structure

```
apps/web/src/
├── pages/
│   └── index.astro                    # Landing page (updated)
├── components/
│   └── landing/
│       ├── navigation.tsx             # Sticky nav with auth state
│       ├── hero-section.tsx           # Main hero with bento grid
│       ├── social-proof.tsx           # Logo cloud / stats
│       ├── features-grid.tsx          # Bento feature cards
│       ├── how-it-works.tsx           # 3-step timeline
│       ├── use-cases.tsx              # Creator vs Dev tabs
│       ├── pricing.tsx                # Pricing cards
│       ├── faq.tsx                    # FAQ accordion
│       ├── final-cta.tsx              # Bottom call-to-action
│       └── footer.tsx                 # Site footer
├── hooks/
│   └── use-scroll-position.ts         # Scroll-based animations
└── styles/
    └── landing.css                    # Landing-specific animations
```

---

## 3. Section-by-Section Design Specifications

### 3.1 Navigation (`navigation.tsx`)

**Layout:**

- Sticky top with backdrop blur
- Logo left, nav center, CTAs right
- Mobile: Hamburger menu

**Components:**

- Logo (text: "Nastro" or custom SVG)
- Nav links: Features, Pricing, Docs, API
- CTA: "Get Started" (primary button)
- Auth state: Show "Dashboard" if logged in

**Behavior:**

- Transparent → solid white/black on scroll
- Smooth transition (300ms)

### 3.2 Hero Section (`hero-section.tsx`)

**Layout:** Bento Grid (2 columns desktop, 1 mobile)

**Content:**

- Headline: "Your Notion content, beautifully published"
- Subheadline: "Turn Notion pages into stunning websites with custom domains, analytics, and zero code. Perfect for creators and developers."
- Primary CTA: "Get Started Free"
- Secondary CTA: "View Demo"

**Visual Elements:**

- Gradient background (subtle)
- 3 preview cards showing transformation
- Animated entry (fade up)

### 3.3 Social Proof (`social-proof.tsx`)

**Layout:** Centered text + logo grid

**Content:**

- "Trusted by 1,000+ creators and developers"
- Logo cloud (6-8 placeholder logos or real if available)
- Stats: "1,000+ sites published" / "99.9% uptime" / "<100ms load time"

**Components:**

- Badge for stats
- Grayscale logos that color on hover

### 3.4 Features Grid (`features-grid.tsx`)

**Layout:** Bento Grid (asymmetric)

**Feature Cards:**

1. **Custom Domains** - "Use your own domain or subdomain. Free SSL included."
2. **Notion as CMS** - "Your content lives in Notion. Edit once, update everywhere."
3. **Real-time Preview** - "See changes instantly as you customize your site."
4. **Analytics** - "Track visitors, page views, and traffic sources."
5. **Developer API** - "Build apps with our REST API. Perfect for headless CMS use cases."

**Styling:**

- Cards with subtle borders
- Hover: slight lift + shadow
- Icons for each feature

### 3.5 How It Works (`how-it-works.tsx`)

**Layout:** Horizontal timeline (3 steps)

**Steps:**

1. **Connect Notion** - "Connect your Notion workspace in one click"
2. **Customize** - "Choose your domain, colors, and fonts"
3. **Publish** - "Go live with a single click. Updates sync automatically."

### 3.6 Use Cases (`use-cases.tsx`)

**Layout:** Tabs (Creator vs Developer)

**Creator Tab:**

- Portfolio websites
- Blog sites
- Documentation
- Landing pages
- Personal websites

**Developer Tab:**

- Headless CMS
- Content APIs
- Documentation sites
- Knowledge bases
- Project wikis

### 3.7 Pricing (`pricing.tsx`)

**Layout:** 2 cards side by side

**Free Tier:**

- 1 site
- nastro.io subdomain
- Basic analytics
- Community support

**Pro Tier:** ($12/month or $120/year)

- Unlimited sites
- Custom domains
- Advanced analytics
- API access
- Priority support

### 3.8 FAQ (`faq.tsx`)

**Layout:** Accordion (centered, max-width)

**Questions:**

1. "Do I need to know how to code?"
2. "Can I use my own domain?"
3. "How does the API work?"
4. "Is my content secure?"
5. "What happens if I cancel?"

### 3.9 Final CTA (`final-cta.tsx`)

**Layout:** Centered, full-width gradient background

### 3.10 Footer (`footer.tsx`)

**Layout:** 4-column grid

---

## 4. Technical Implementation Details

### 4.1 Component Architecture

**No Slop Code Principles:**

1. **Single responsibility** - Each component does one thing
2. **No prop drilling** - Use composition
3. **Type-safe** - Full TypeScript
4. **Reusable** - Components usable elsewhere
5. **Accessible** - ARIA labels, keyboard nav

### 4.2 Animation Strategy

**Entry Animations:**

- Fade in + translate Y (20px → 0)
- Stagger children (100ms delay)
- Duration: 500ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)

**Implementation:**

```tsx
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};
```

---

## 5. Implementation Checklist

### Phase 1: Foundation (30 min)

- [ ] Install framer-motion for animations
- [ ] Create landing/ directory structure
- [ ] Set up base layout in index.astro

### Phase 2: Core Sections (2 hours)

- [ ] Navigation component
- [ ] Hero section with bento
- [ ] Features grid (bento)

### Phase 3: Content Sections (1.5 hours)

- [ ] Pricing cards
- [ ] FAQ accordion
- [ ] Footer

### Phase 4: Polish (30 min)

- [ ] Add all animations
- [ ] Responsive testing
- [ ] SEO meta tags

---

## 6. File-by-File Implementation

### 6.1 Navigation (`navigation.tsx`)

```tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b"
          : "bg-transparent",
      )}
    >
      <nav className="container flex items-center justify-between h-16">
        <a href="/" className="text-xl font-bold">
          Nastro
        </a>

        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <a href="/login">Sign In</a>
          </Button>
          <Button size="sm" asChild>
            <a href="/login">Get Started</a>
          </Button>
        </div>
      </nav>
    </header>
  );
}
```

### 6.2 Hero Section (`hero-section.tsx`)

```tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none" />

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your Notion content,{" "}
            <span className="text-primary">beautifully published</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Turn Notion pages into stunning websites with custom domains,
            analytics, and zero code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#demo">
                <Play className="mr-2 h-4 w-4" />
                View Demo
              </a>
            </Button>
          </div>
        </div>

        {/* Bento Grid Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="bg-muted rounded-xl p-6 border">
            <div className="text-sm text-muted-foreground mb-2">
              Notion Page
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-primary/20 rounded w-3/4" />
              <div className="h-3 bg-primary/20 rounded w-1/2" />
              <div className="h-3 bg-primary/20 rounded w-5/6" />
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-xl p-6">
            <div className="text-sm opacity-80 mb-2">Nastro Transform</div>
            <div className="font-semibold">Instant Website</div>
          </div>

          <div className="bg-muted rounded-xl p-6 border">
            <div className="text-sm text-muted-foreground mb-2">Live Site</div>
            <div className="space-y-2">
              <div className="h-8 bg-primary/20 rounded" />
              <div className="h-3 bg-primary/20 rounded w-3/4" />
              <div className="h-3 bg-primary/20 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 6.3 Features Grid (`features-grid.tsx`)

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Globe, FileText, Eye, BarChart3, Code } from "lucide-react";

const features = [
  {
    title: "Custom Domains",
    description: "Use your own domain with free SSL.",
    icon: Globe,
  },
  {
    title: "Notion as CMS",
    description: "Your content lives in Notion. Edit once, update everywhere.",
    icon: FileText,
  },
  {
    title: "Real-time Preview",
    description: "See changes instantly as you customize.",
    icon: Eye,
  },
  {
    title: "Analytics",
    description: "Track visitors and traffic sources.",
    icon: BarChart3,
  },
  {
    title: "Developer API",
    description: "RESTful API for fetching Notion content.",
    icon: Code,
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features for creators and developers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <feature.icon className="h-8 w-8 mb-4 text-primary" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 6.4 Pricing (`pricing.tsx`)

```tsx
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "For personal projects",
    price: { monthly: 0, yearly: 0 },
    features: [
      "1 site",
      "Nastro.io subdomain",
      "Basic analytics",
      "Community support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals",
    price: { monthly: 12, yearly: 120 },
    features: [
      "Unlimited sites",
      "Custom domains",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    popular: true,
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple pricing
          </h2>
          <div className="flex items-center justify-center gap-3">
            <span className={isYearly ? "text-muted-foreground" : ""}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={isYearly ? "" : "text-muted-foreground"}>
              Yearly <span className="text-primary text-sm">(Save 17%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-muted-foreground">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="/login">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### 6.5 Footer (`footer.tsx`)

```tsx
export function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Nastro</h3>
            <p className="text-sm text-muted-foreground">
              Turn Notion into beautiful websites.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/docs">Documentation</a>
              </li>
              <li>
                <a href="/api">API</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 Nastro. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

### 6.6 Index Page (`index.astro`)

```astro
---
import Layout from "@/layouts/Layout.astro";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
---

<Layout title="Nastro - Turn Notion into Beautiful Websites" description="Publish your Notion pages as stunning websites with custom domains, analytics, and zero code.">
  <Navigation client:load />
  <main>
    <HeroSection client:load />
    <FeaturesGrid client:load />
    <Pricing client:load />
    <Footer />
  </main>
</Layout>
```

---

## 7. Quality Standards

### No Slop Code Checklist:

- [ ] Single responsibility components
- [ ] TypeScript interfaces for all props
- [ ] No unnecessary abstractions
- [ ] Accessible (aria-labels, keyboard nav)
- [ ] Mobile responsive (all breakpoints)
- [ ] Clean imports (no unused)
- [ ] Consistent naming conventions

### Design Polish:

- [ ] 4px spacing grid
- [ ] Typography hierarchy
- [ ] OKLCH color consistency
- [ ] Smooth 60fps animations
- [ ] Hover states on interactive elements

---

## 8. Next Steps

1. **Install dependency:** `pnpm add framer-motion`
2. **Create directory:** `mkdir -p apps/web/src/components/landing`
3. **Implement sections** in order: Nav → Hero → Features → Pricing → Footer
4. **Update** `index.astro` to use new components
5. **Test** on mobile, tablet, desktop
6. **Deploy** and verify

**Estimated Time:** 4-5 hours  
**Complexity:** Medium  
**Risk:** Low

---

**Plan Version:** 1.0  
**Status:** Ready for Implementation  
**Philosophy:** Clean code, polished design, zero slop
