"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Switching from OOP to functional for our data pipeline cut processing time by 60%. The paradigm tool helped us see the trade-offs clearly.",
    author: "Sarah Chen",
    role: "Senior Engineer",
    company: "FinTech Startup"
  },
  {
    quote: "We were stuck in callback hell until we adopted reactive programming. The council tool helped our team align on the decision.",
    author: "Marcus Williams",
    role: "Tech Lead",
    company: "StreamData Inc"
  },
  {
    quote: "The debug approach guided us through a complex race condition we'd been fighting for weeks. Systematic thinking changed everything.",
    author: "Elena Rodriguez",
    role: "Staff Engineer",
    company: "CloudScale"
  },
  {
    quote: "First principles thinking helped us challenge assumptions about our architecture. We ended up with something much simpler.",
    author: "David Park",
    role: "Principal Architect",
    company: "TechVenture"
  }
];

const companies = ["FinTech Startup", "StreamData Inc", "CloudScale", "TechVenture", "DataFlow", "Nexus Labs"];

export function DesignTestimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Magnetic effect for the number
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  // Auto-rotate testimonials every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Magnetic mouse effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * 0.1);
    mouseY.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const activeTestimonial = testimonials[activeIndex];

  // Split quote into words for animation
  const words = activeTestimonial.quote.split(" ");

  return (
    <section
      className="relative py-24 px-6 bg-[hsl(var(--background))] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--accent))] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--secondary))] rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left: Parallax Number */}
          <div className="col-span-3 relative">
            <motion.div
              style={{ x: springX, y: springY }}
              className="relative"
            >
              <span className="text-[180px] font-bold leading-none text-[hsl(var(--muted-foreground))] opacity-20 select-none">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
            </motion.div>

            {/* Vertical Progress Indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className="group relative"
                >
                  <div
                    className={`w-1 h-8 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? "bg-[hsl(var(--secondary))]"
                        : "bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground))]"
                    }`}
                  />
                  {idx === activeIndex && (
                    <motion.div
                      layoutId="progress-fill"
                      className="absolute inset-0 w-1 bg-[hsl(var(--secondary))] rounded-full"
                      initial={{ scaleY: 0, originY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 6, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Quote with word-by-word animation */}
          <div className="col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Quote - using editorial font (Nocturno Display) for pull quote effect */}
                <blockquote className="relative">
                  <span
                    className="absolute -left-8 -top-4 text-6xl text-[hsl(var(--accent))] opacity-30"
                    style={{ fontFamily: "'Nocturno Display', Georgia, serif" }}
                  >
                    &ldquo;
                  </span>
                  <p
                    className="text-2xl md:text-3xl leading-relaxed text-[hsl(var(--foreground))]"
                    style={{ fontFamily: "'Nocturno Display', Georgia, serif" }}
                  >
                    {words.map((word, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          duration: 0.3,
                          ease: "easeOut"
                        }}
                        className="inline-block mr-2"
                      >
                        {word}
                      </motion.span>
                    ))}
                  </p>
                </blockquote>

                {/* Author */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-white font-semibold">
                    {activeTestimonial.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-[hsl(var(--foreground))]"
                      style={{ fontFamily: "'Manrope', system-ui, sans-serif" }}
                    >
                      {activeTestimonial.author}
                    </p>
                    <p
                      className="text-sm text-[hsl(var(--muted-foreground))]"
                      style={{ fontFamily: "'Graphik', system-ui, sans-serif" }}
                    >
                      {activeTestimonial.role} at {activeTestimonial.company}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom: Company ticker */}
        <div className="mt-16 border-t border-[hsl(var(--border))] pt-8">
          <p className="text-xs uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">
            Trusted by teams at
          </p>
          <div className="flex items-center gap-12 overflow-hidden">
            <motion.div
              className="flex items-center gap-12"
              animate={{ x: [0, -200] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {[...companies, ...companies].map((company, idx) => (
                <span
                  key={idx}
                  className="text-lg font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity"
                >
                  {company}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
