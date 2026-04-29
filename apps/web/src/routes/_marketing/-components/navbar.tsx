import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconMenu, IconX } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/50"
          : "bg-transparent",
      )}
    >
      <nav className=" mx-auto py-2 px-4 flex items-center  justify-between border-b">
        {/* Logo */}
        <motion.a
          href="/"
          className=""
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo />
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex  items-center gap-8">
          {navLinks.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors overflow-hidden"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <IconX className="h-5 w-5" />
          ) : (
            <IconMenu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: mobileMenuOpen ? "auto" : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="md:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border/50"
      >
        <div className="px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
            <Link className=" w-full" to="/login">
              <Button className={"w-full"} variant="secondary">
                Sign In
              </Button>
            </Link>
            <Link className=" w-full" to="/dashboard">
              <Button className={"w-full"}>Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
}
