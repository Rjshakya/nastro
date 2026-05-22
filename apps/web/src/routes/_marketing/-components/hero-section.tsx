import { Button } from "@/components/ui/button";
import { IconArrowDown, IconArrowRight } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

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
  const session = authClient.useSession();

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      <div className="relative container mx-auto px-4 sm:px-6">
        {/* Hero Content */}
        <motion.div
          className="mb-16 grid gap-4 text-left"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.h1
            variants={fadeInUp}
            className="mb-2 max-w-lg text-4xl font-medium tracking-[-0.06em] sm:text-4xl"
          >
            Turn your Notion pages into{" "}
            <span className="">beautiful websites</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-4 max-w-md text-sm font-medium text-muted-foreground"
          >
            Publish your Notion content with custom domains, real-time sync, and
            zero code. Perfect for creators, developers, and teams.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="md:px-.5 flex items-center justify-start gap-4"
          >
            <Link to={session?.data?.session ? "/dashboard" : "/login"}>
              <Button size="lg" className="flex items-center gap-1 px-4 ">
                <p>Get Started Free</p>
                <IconArrowRight stroke={3} />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="h-16 w-full" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative mb-16 p-6 sm:p-12 lg:p-16 bg-accent"
        >
          {/* <div className="absolute inset-0 size-full">
            <img src="/hero.png" className="h-full w-full object-cover" />
          </div> */}

          <div className="relative z-10 grid p-0 md:p-8">
            <div className="p-1 before overflow-hidden rounded-2xl border border-border/20 ring ring-ring/40 drop-shadow-2xl">
              <img className="size-full" src="/before.webp" />
            </div>

            <div className=" flex items-center justify-center py-6 md:py-8">
              <Button size={"icon-lg"}>
                <IconArrowDown className="size-6" />
              </Button>
            </div>

            <div className="p-1 after overflow-hidden rounded-2xl border border-border/20 ring ring-ring/40 drop-shadow-2xl">
              <img src="/after.webp" className="size-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
