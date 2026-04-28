import { motion } from "motion/react";
import { IconBrandGithub, IconBrandX } from "@tabler/icons-react";
import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", icon: IconBrandGithub },
  { label: "X", href: "https://x.com", icon: IconBrandX },
];

export function Footer() {
  return (
    <footer className="">
      <div className="container  mx-auto px-4 sm:px-6 py-16">
        <motion.div
          className="max-w-5xl mx-auto border p-5 bg-muted"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            {/* Logo and tagline */}
            <div className="space-y-4">
              <Link to="/">
                <Logo />
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Turn your Notion pages into beautiful websites.
              </p>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Social */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" stroke={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Nastro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
