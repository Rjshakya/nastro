import { Button } from "#/components/ui/button";
import { ArrowRight, Play, Sparkles, Globe, Zap } from "lucide-react";
import { motion } from "motion/react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Hero Content */}
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Launch your site in minutes
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Turn your Notion pages into{" "}
            <span className="text-primary">beautiful websites</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Publish your Notion content with custom domains, real-time sync, and
            zero code. Perfect for creators, developers, and teams.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/login">
              <Button size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#demo">
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                View Demo
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Bento Grid Visual */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Card 1: Notion Page */}
          <motion.div
            className="bg-muted/50 rounded-2xl p-6 border border-border/50"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Your Notion
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-3/4" />
              <div className="h-3 bg-foreground/10 rounded w-1/2" />
              <div className="h-3 bg-foreground/10 rounded w-5/6" />
              <div className="h-3 bg-foreground/10 rounded w-2/3" />
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Auto-sync enabled
              </div>
            </div>
          </motion.div>

          {/* Card 2: Nastro Transform */}
          <motion.div
            className="bg-primary text-primary-foreground rounded-2xl p-6 relative overflow-hidden"
            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="text-sm opacity-80 mb-2">Nastro</div>
              <div className="font-semibold text-2xl mb-2">Transform</div>
              <p className="text-sm opacity-90 mb-4">
                Custom domains, themes, and analytics in one click
              </p>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">yoursite.com</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Live Site */}
          <motion.div
            className="bg-muted/50 rounded-2xl p-6 border border-border/50"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">Live Site</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-primary/20 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 bg-foreground/10 rounded w-full" />
                <div className="h-3 bg-foreground/10 rounded w-4/5" />
                <div className="h-3 bg-foreground/10 rounded w-3/5" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="h-16 bg-primary/10 rounded-lg" />
                <div className="h-16 bg-primary/10 rounded-lg" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {[
            { value: "1,000+", label: "Sites published" },
            { value: "99.9%", label: "Uptime" },
            { value: "<100ms", label: "Load time" },
            { value: "50K+", label: "Page views" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
