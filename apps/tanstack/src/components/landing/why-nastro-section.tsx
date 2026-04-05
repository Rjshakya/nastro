import { motion } from "motion/react";
import { Button } from "#/components/ui/button";
import {
  IconArrowUpRight,
  IconBrandNotion,
  IconBulb,
  IconCurrencyDollar,
  IconLock,
  IconNotebook,
  IconPalette,
  IconPencil,
  IconRocket,
  IconSearch,
  IconSparkles,
  IconWorld,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "../ui/card";

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
    icon: IconWorld,
    title: "Your own subdomain, instantly",
    description: "Get yourname.nastro.xyz in seconds. Or bring your custom domain.",
  },
];

const useCases = [
  {
    icon: IconSparkles,
    title: "Make it truly yours",
    description:
      "Add your own taste, style, and personality. Your site should feel like you, not a template.",
  },
  {
    icon: IconRocket,
    title: "Launch your first site",
    description: "Perfect for your first website. No coding required, just your Notion content.",
  },
  {
    icon: IconPencil,
    title: "Blog under your name",
    description:
      "eliza.nastro.xyz — publish your thoughts with a personal subdomain that feels professional.",
  },
  {
    icon: IconBulb,
    title: "Validate ideas fast",
    description:
      "Build a landing page or small ecommerce site without spending thousands on development.",
    span: "sm:col-span-2 lg:col-span-1",
  },
  {
    icon: IconNotebook,
    title: "Customize your journal",
    description:
      "Make your Notion journal feel good to use. Colors, fonts, layouts — exactly how you want.",
    span: "sm:col-span-2 lg:col-span-2",
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
      <div className="container mx-auto px-4 sm:px-6  relative ">
        {/* Hero Hook */}
        <motion.div
          className="max-w-5xl mx-auto  mb-16 text-left grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <motion.h1
            variants={fadeInUp}
            className="max-w-lg text-4xl sm:text-4xl  tracking-[-0.06em]"
          >
            <span className=" text-muted-foreground">Your Notion pages,</span>
            <br />
            but actually yours
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-sm  text-muted-foreground mb-12 max-w-md">
            Turn your Notion content into a beautiful website that reflects
            <span className="text-foreground"> your taste</span>. No code. No expensive
            subscriptions. Just sit back, relax, and make it yours.
          </motion.p>
        </motion.div>

        {/* Problem vs Solution Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-20 sm:mb-28 max-w-5xl mx-auto">
          {/* The Problem */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ margin: "-100px" }}
            className=" "
          >
            <h3 className=" capitalize text-sm font-medium text-muted-foreground  mb-6">problem</h3>
            <div className="bg-[url(/cool-bg-2.png)] p-4">
              <div className=" bg-background p-4 ">
                {painPoints.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4 p-4  bg-muted/50 border border-border/60"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Button size={"icon"} variant={"outline"} className={"dark:border-border"}>
                        <point.icon className={`size-5`} stroke={1.5} />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <h4 className="">{point.title}</h4>
                      <p className="text-xs text-muted-foreground">{point.description}</p>
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
            viewport={{ margin: "-100px" }}
            className=" "
          >
            <h3 className=" capitalize text-sm font-medium text-muted-foreground  mb-6">
              Solution
            </h3>
            <div className="bg-[url(/cool-bg-3.png)] p-4">
              <div className=" bg-background p-4 ">
                {solutions.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex gap-4 p-4  bg-muted/50 border border-border/60"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Button size={"icon"} variant={"outline"} className={"dark:border-border"}>
                        <point.icon className={`size-5`} stroke={1.5} />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <h4 className="">{point.title}</h4>
                      <p className="text-xs text-muted-foreground">{point.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className=" h-40 w-full" />

        {/* Why Nastro Exists */}
        <motion.div
          className="max-w-5xl mx-auto text-center mb-16 sm:mb-20 grid gap-4 "
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <h3 className=" text-4xl sm:text-4xl  tracking-[-0.06em]">Why Nastro exists</h3>
          <p className="text-sm  text-muted-foreground mb-12 ">
            We built this because we needed it ourselves
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3  mb-30 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ margin: "-100px" }}
        >
          {useCases.map((useCase) => (
            <motion.div key={useCase.title} variants={itemVariants} className={useCase.span}>
              <Card className=" group transition-all duration-300   hover:bg-muted/50 rounded-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Button size={"icon"} variant={"outline"} className={"dark:border-border"}>
                      <useCase.icon className={`size-5`} stroke={1.5} />
                    </Button>
                  </div>
                  <h4 className="text-lg mb-2">{useCase.title}</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">{useCase.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center max-w-5xl mx-auto flex flex-col items-center "
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        >
          <Link to="/dashboard" className="">
            <Button size="lg" className="rounded-sm  px-4 flex items-center gap-1">
              <p>Start building for free</p>
              <IconArrowUpRight />
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
