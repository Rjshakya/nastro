import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { Switch } from "#/components/ui/switch";
import { IconCheck } from "@tabler/icons-react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";

const plans = [
  {
    name: "Starting",
    description: "For personal projects and experiments",
    price: { monthly: 1, yearly: 1 },
    features: [
      "10 site",
      "nastro.xyz subdomain",
      "Basic analytics",
      "Community support",
      "Standard themes",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals and growing businesses",
    price: { monthly: 5, yearly: 50 },
    features: [
      "Unlimited sites",
      "Custom domains",
      "Advanced analytics",
      "API access",
      "Priority support",
      "Custom themes",
      "Remove Nastro branding",
    ],
    cta: "Upgrade to Pro",
    popular: true,
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

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          className="max-w-5xl mx-auto mb-16 text-left grid gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <h2 className="max-w-lg text-4xl tracking-[-0.06em]">Simple, transparent pricing</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Start for just $1 , upgrade when you're ready
          </p>

          {/* Billing Toggle - Fixed Layout Shift */}
          <div className="flex items-center gap-4 mt-4">
            <span className={`text-sm ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {/* Always rendered badge with opacity transition - no layout shift */}
            <span
              className={`text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full transition-opacity duration-200 ${isYearly ? "opacity-100" : "opacity-0"}`}
            >
              Save 17%
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={itemVariants}>
              <Card className="relative h-full rounded-none flex">
                <CardHeader className={`pb-4`}>
                  <CardTitle className="">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1">
                  {/* Fixed-height price container - no layout shift */}
                  <div className="h-16 flex items-baseline gap-1">
                    <span className="text-5xl">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <IconCheck className="h-4 w-4 text-primary flex-shrink-0" stroke={2} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Link to="/dashboard" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          className="text-center mt-12 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        >
          <p className="text-sm text-muted-foreground">
            Just $1 required to start. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
