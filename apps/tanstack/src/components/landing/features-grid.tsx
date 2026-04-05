import { Card, CardContent } from "#/components/ui/card";
import {
  IconWorld,
  IconBrandNotion,
  IconChartBar,
  IconCode,
  IconPalette,
  IconSearch,
  IconEye,
  IconBrandGoogleAnalytics,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";

const features = [
  {
    title: "Free .nastro.xyz subdomain",
    description:
      "Get started instantly with a free subdomain. No domain purchase required to publish your site.",
    icon: IconWorld,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "md:col-span-2",
  },
  {
    title: "Custom domains",
    description: "Connect your own domain with free SSL certificates automatically provisioned.",
    icon: IconWorld,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "",
  },
  {
    title: "Notion as CMS",
    description: "Your content lives in Notion. Edit once, update everywhere automatically.",
    icon: IconBrandNotion,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "",
  },

  {
    title: "Custom themes",
    description:
      "Full control over colors, fonts, spacing, and layouts. Match your brand perfectly.",
    icon: IconPalette,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "",
  },
  {
    title: "Full SEO control",
    description: "Custom titles, descriptions, OG images, favicons, and page URLs for every page.",
    icon: IconSearch,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "",
  },
  {
    title: "Built-in analytics",
    description: "Track visitors, page views, and traffic sources. Basic on free, advanced on Pro.",
    icon: IconBrandGoogleAnalytics,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "md:col-span-2",
  },
  {
    title: "Real-time preview",
    description: "See changes instantly as you customize colors, fonts, and layouts in the editor.",
    icon: IconEye,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "",
  },
  {
    title: "Developer API",
    description: "RESTful API for fetching Notion content. Perfect for headless CMS use cases.",
    icon: IconCode,
    color: "text-foreground",
    bgColor: "bg-secondary",
    span: "md:col-span-3",
    badge: "Coming soon",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          className="max-w-5xl mx-auto  mb-16 text-left grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <h2 className="max-w-lg text-4xl sm:text-4xl  tracking-[-0.06em]">Everything you need</h2>
          <p className="text-sm  text-muted-foreground mb-12 max-w-md">
            Powerful features for creators and developers. Build your site without writing code.
          </p>
        </motion.div>

        {/* Features Bento Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants} className={feature.span}>
              <Card className=" group transition-all duration-300   hover:bg-muted/50 rounded-none">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Button size={"icon"} variant={"outline"} className={`dark:border-border`}>
                      <feature.icon className={`size-5 ${feature.color}`} stroke={1.5} />
                    </Button>
                    {feature.badge && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground text-xs max-w-xs">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
