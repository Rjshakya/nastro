import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import {
  IconArrowRight,
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
} from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"

const painPoints = [
  {
    icon: IconBrandNotion,
    title: "Notion sites look... like Notion",
    description:
      "Generic styling. Zero personality. Everyone's site looks exactly the same.",
  },
  {
    icon: IconCurrencyDollar,
    title: "SEO & analytics cost extra",
    description:
      "Want custom domains? SEO? Analytics? That'll be $8-16/month please.",
  },
  {
    icon: IconLock,
    title: "Zero customization control",
    description:
      "Can't change colors, fonts, or layouts. What you see is what you're stuck with.",
  },
]

const solutions = [
  {
    icon: IconPalette,
    title: "Customize literally everything",
    description:
      "Background colors, button styles, text selection, fonts, spacing — you name it.",
  },
  {
    icon: IconSearch,
    title: "SEO & analytics, free",
    description:
      "Custom meta tags, OG images, favicons, plus Google Analytics. No catches.",
  },
  {
    icon: IconWorld,
    title: "Your own subdomain, instantly",
    description:
      "Get yourname.nastro.xyz in seconds. Or bring your custom domain.",
  },
]

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
    description:
      "Perfect for your first website. No coding required, just your Notion content.",
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
]

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
}

export function WhyNastroSection() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Hero Hook */}
        <motion.div
          className="mb-16 grid gap-4 text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <motion.h1
            variants={fadeInUp}
            className="mb-2 max-w-lg text-4xl font-medium tracking-[-0.06em] sm:text-4xl"
          >
            <span className="">Your Notion pages,</span>
            <br />
            but actually yours
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-12 max-w-md text-sm font-medium text-muted-foreground"
          >
            Turn your Notion content into a beautiful website that reflects
            <span className="text-foreground"> your taste</span>. No code. No
            expensive subscriptions. Just sit back, relax, and make it yours.
          </motion.p>
        </motion.div>

        {/* Problem vs Solution Grid */}
        <div className="relative mx-auto mb-20 max-w-3xl sm:mb-28">
          <div className="absolute inset-0">
            <img
              src="/why-nastro.webp"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative z-10 space-y-10 px-6 py-18 sm:p-18">
            {/* The Problem */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ margin: "-100px" }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-lg bg-background px-4 py-2 shadow-sm">
                <h3 className="text-sm font-semibold">Problem</h3>
              </div>
              <div className="grid gap-1">
                {painPoints.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex items-start gap-4 rounded-xl border border-border/30 bg-background p-5 shadow-sm"
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 dark:border-border"
                    >
                      <point.icon className="size-5" stroke={1.5} />
                    </Button>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{point.title}</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* The Solution */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ margin: "-100px" }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-lg bg-background px-4 py-2 shadow-sm">
                <h3 className="text-sm font-semibold">Solution</h3>
              </div>
              <div className="grid gap-1">
                {solutions.map((point) => (
                  <motion.div
                    key={point.title}
                    variants={itemVariants}
                    className="flex items-start gap-4 rounded-xl border border-border/30 bg-background p-5 shadow-sm"
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 dark:border-border"
                    >
                      <point.icon className="size-5" stroke={1.5} />
                    </Button>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{point.title}</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="h-40 w-full" />

        {/* Why Nastro Exists */}
        <motion.div
          className="mb-16 grid gap-4 text-center sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <h3 className="text-4xl font-medium tracking-[-0.06em] sm:text-4xl">
            Why Nastro exists
          </h3>
          <p className="mb-12 text-sm font-medium text-muted-foreground">
            We built this because we needed it ourselves
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          className="mb-30 grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ margin: "-100px" }}
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={itemVariants}
              className={useCase.span}
            >
              <Card className="group h-full border border-ring/40 ring ring-ring/30 transition-all duration-300 hover:bg-muted/50">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className={"dark:border-border"}
                    >
                      <useCase.icon className={`size-5`} stroke={1.5} />
                    </Button>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold">
                    {useCase.title}
                  </h4>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="flex flex-col items-center text-center"
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
            <Button size="lg" className="flex items-center gap-1 px-4">
              <p>Start building for free</p>
              <IconArrowRight stroke={3} />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free subdomain included.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
