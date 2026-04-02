import { Card, CardContent } from "#/components/ui/card";
import {
  Globe,
  FileText,
  Eye,
  BarChart3,
  Code,
  Palette,
  Lock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    title: "Custom Domains",
    description:
      "Use your own domain or subdomain. Free SSL certificate included with every site.",
    icon: Globe,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Notion as CMS",
    description:
      "Your content lives in Notion. Edit once, and it updates everywhere automatically.",
    icon: FileText,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Real-time Preview",
    description:
      "See changes instantly as you customize colors, fonts, and layouts.",
    icon: Eye,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Analytics",
    description:
      "Track visitors, page views, and traffic sources with built-in analytics.",
    icon: BarChart3,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Developer API",
    description:
      "RESTful API for fetching Notion content. Perfect for headless CMS use cases.",
    icon: Code,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Custom Themes",
    description:
      "Choose from pre-built themes or customize every detail to match your brand.",
    icon: Palette,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Secure & Private",
    description: "Your data is encrypted. We never store your Notion content.",
    icon: Lock,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "Lightning Fast",
    description:
      "Edge-cached sites load in milliseconds. Optimized for performance.",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features for creators and developers. Build your site
            without writing a single line of code.
          </p>
        </motion.div>

        {/* Features Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={index === 0 || index === 3 ? "md:col-span-2" : ""}
            >
              <Card className="h-full group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
