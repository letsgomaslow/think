"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isToolPage = pathname?.startsWith("/tools/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (section: string) => {
    setIsMobileMenuOpen(false);
    if (isToolPage) {
      router.push(`/#${section}`);
    } else {
      const element = document.getElementById(section);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { label: "Tools", section: "tools" },
    { label: "Waitlist", section: "waitlist" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#121D35]/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 xs:px-5 sm:px-6 md:px-8">
        <div className="flex items-center justify-between py-3 xs:py-3.5 sm:py-4">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group touch-target-min"
          >
            <span className="text-2xl xs:text-2.5xl sm:text-3xl font-bold text-white font-[family-name:var(--font-manrope)] transition-colors group-hover:text-[hsl(var(--brand-primary))]">
              Think
            </span>
            <Image
              src="/logos/maslow_just_logo_white.webp"
              alt="Maslow AI"
              width={24}
              height={24}
              className="w-5 h-5 xs:w-6 xs:h-6 sm:w-6 sm:h-6 opacity-70 transition-opacity group-hover:opacity-100"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => handleNavClick(item.section)}
                className="text-white hover:text-[hsl(var(--brand-primary))] transition-colors duration-200 font-[family-name:var(--font-graphik)] font-medium text-sm lg:text-base touch-target-min"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[hsl(var(--brand-primary))] transition-colors touch-target-min"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 xs:w-6 xs:h-6" />
            ) : (
              <Menu className="w-5 h-5 xs:w-6 xs:h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4 border-t border-white/10">
                {navItems.map((item) => (
                  <button
                    key={item.section}
                    onClick={() => handleNavClick(item.section)}
                    className="block w-full text-left text-white hover:text-[hsl(var(--brand-primary))] transition-colors duration-200 font-[family-name:var(--font-graphik)] font-medium text-sm xs:text-base py-2 xs:py-2.5 touch-target-min"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;
