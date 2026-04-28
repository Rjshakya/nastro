import { Button } from "@/components/ui/button";
import { IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Comparison, ComparisonHandle, ComparisonItem } from "@/components/kibo-ui/comparison";

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
      <div className="container mx-auto px-4 sm:px-6  relative">
        {/* Hero Content */}
        <motion.div
          className="max-w-5xl mx-auto  mb-16 text-left grid gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={fadeInUp}
            className="max-w-lg text-4xl sm:text-4xl  tracking-[-0.06em]"
          >
            Turn your Notion pages into <span className="text-primary">beautiful websites</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-sm  text-muted-foreground mb-12 max-w-md">
            Publish your Notion content with custom domains, real-time sync, and zero code. Perfect
            for creators, developers, and teams.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="md:px-.5 flex items-center justify-start gap-4 "
          >
            <Link to="/dashboard">
              <Button size="lg" className="rounded-sm px-4 flex items-center gap-1">
                <p>Get Started Free</p>
                <IconArrowUpRight />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="h-16 w-full" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-5xl mx-auto bg-[url(/cool-bg-1.png)] sm:p-12 lg:p-16 p-6 mb-16"
        >
          <Comparison className="aspect-square sm:aspect-video" mode="drag">
            <ComparisonItem className="" position="left">
              <img
                alt="Placeholder 1"
                className="h-full object-cover rounded-md"
                src="/nastro.png"
              />
            </ComparisonItem>
            <ComparisonItem className="" position="right">
              <img
                alt="Placeholder 2"
                className="h-full object-cover rounded-md"
                src="/nastro-demo-2.png"
              />
            </ComparisonItem>
            <ComparisonHandle />
          </Comparison>
        </motion.div>
      </div>
    </section>
  );
}
