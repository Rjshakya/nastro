import { motion } from "motion/react";
import { Button } from "#/components/ui/button";
import {
  IconBrandNotion,
  IconCurrencyDollar,
  IconLock,
  IconPalette,
  IconRocket,
  IconSearch,
  IconWorldWww,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const painPoints = [
  {
    icon: IconBrandNotion,
    title: "Notion sites look... like Notion",
    description: "Generic styling. Zero personality. Everyone's site looks exactly the same.",
  },
  {
    icon: IconCurrencyDollar,
    title: "SEO & analytics cost extra",
    description: "Want custom domains? SEO? Analytics? That'll be $8-16/month please.",
  },
  {
    icon: IconLock,
    title: "Zero customization control",
    description: "Can't change colors, fonts, or layouts. What you see is what you're stuck with.",
  },
];

const solutions = [
  {
    icon: IconPalette,
    title: "Customize literally everything",
    description: "Background colors, button styles, text selection, fonts, spacing — you name it.",
  },
  {
    icon: IconSearch,
    title: "SEO & analytics, free",
    description: "Custom meta tags, OG images, favicons, plus Google Analytics. No catches.",
  },
  {
    icon: IconWorldWww,
    title: "Your own subdomain, instantly",
    description: "Get yourname.nastro.xyz in seconds. Or bring your custom domain.",
  },
];

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

export function WhyNastroSection() {
  return (
    <section className="py-24 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Hero Hook */}
        <motion.div
          className="max-w-5xl  mb-16 sm:mb-24 grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <motion.h1
            variants={fadeInUp}
            className=" max-w-lg text-4xl sm:text-4xl  tracking-[-0.06em]"
          >
            Your Notion pages,
            <br />
            <span className="text-muted-foreground">but actually yours</span>{" "}
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-sm  text-muted-foreground mb-12 max-w-md">
            Turn your Notion content into a beautiful website that reflects
            <span className="text-foreground"> your style</span>. No code. No expensive
            subscriptions. Just sit back, relax, and make it yours.
          </motion.p>
        </motion.div>

        {/* Problem vs Solution Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 sm:mb-28">
          {/* The Problem */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className=" "
          >
            <h3 className=" capitalize text-sm font-medium text-muted-foreground  mb-6">problem</h3>
            <div className="bg-[url(/cool-bg-2.png)] p-4">
              <div className="space-y-4 bg-background p-2 ">
                {painPoints.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4 p-4  bg-muted/50 border border-border/60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                      <point.icon className="w-5 h-5 text-muted-foreground" stroke={1.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="">{point.title}</h4>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            className=" "
          >
            <h3 className=" capitalize text-sm font-medium text-muted-foreground  mb-6">
              Solution
            </h3>
            <div className="bg-[url(/cool-bg-3.png)] p-4">
              <div className="space-y-4 bg-background p-2 ">
                {solutions.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4 p-4  bg-muted/50 border border-border/60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0">
                      <point.icon className="w-5 h-5 text-muted-foreground" stroke={1.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="">{point.title}</h4>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Why Nastro Exists */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <h3 className="text-2xl sm:text-3xl tracking-[-0.03em] font-medium mb-4">
            Why Nastro exists
          </h3>
          <p className="text-muted-foreground mb-8">We built this because we needed it ourselves</p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              emoji: "✨",
              title: "Make it truly yours",
              description:
                "Add your own taste, style, and personality. Your site should feel like you, not a template.",
            },
            {
              emoji: "🚀",
              title: "Launch your first site",
              description:
                "Perfect for your first website. No coding required, just your Notion content.",
            },
            {
              emoji: "✍️",
              title: "Blog under your name",
              description:
                "eliza.nastro.xyz — publish your thoughts with a personal subdomain that feels professional.",
            },
            {
              emoji: "💡",
              title: "Validate ideas fast",
              description:
                "Build a landing page or small ecommerce site without spending thousands on development.",
              span: "sm:col-span-2 lg:col-span-1",
            },
            {
              emoji: "📓",
              title: "Customize your journal",
              description:
                "Make your Notion journal feel good to use. Colors, fonts, layouts — exactly how you want.",
              span: "sm:col-span-2 lg:col-span-2",
            },
          ].map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={itemVariants}
              className={`p-5 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors ${useCase.span || ""}`}
            >
              <span className="text-2xl mb-3 block">{useCase.emoji}</span>
              <h4 className="font-medium mb-2">{useCase.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        >
          <Link to="/dashboard">
            <Button size="lg" className="rounded-full px-8">
              <IconRocket className="w-4 h-4 mr-2" stroke={1.5} />
              Start building for free
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required. Free subdomain included.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
