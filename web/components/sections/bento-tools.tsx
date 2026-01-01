"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toolCategories, Tool } from "@/components/tools/tools-data";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  index: number;
  isLarge?: boolean;
}

function ToolCard({ tool, index, isLarge = false }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link href={`/tools/${tool.id}`} className="block cursor-pointer">
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-slate-900/50 border border-slate-700/50",
        "hover:border-slate-600/50 hover:scale-[1.02] transition-all duration-300",
        isLarge && "min-h-[280px]"
      )}
      style={{
        boxShadow: `0 0 0 1px rgba(0,0,0,.1), 0 0 30px ${tool.color.replace(")", " / 0.05)")}`,
      }}
    >
      {/* Gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${tool.color.replace(")", " / 0.1)")}, transparent 40%)`,
        }}
      />

      {/* Icon background glow */}
      <div className="absolute top-4 left-4">
        <div
          className="absolute w-16 h-16 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ backgroundColor: tool.color }}
        />
      </div>

      {/* Content */}
      <div className="relative p-6">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{
            backgroundColor: tool.color.replace(")", " / 0.15)"),
            color: tool.color,
          }}
        >
          <Icon className="w-6 h-6" />
        </div>

        {/* Title + Tagline */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-1 font-[family-name:var(--font-manrope)]">
            {tool.name}
          </h3>
          <p className="text-sm" style={{ color: tool.color }}>
            {tool.tagline}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4">
          {tool.description}
        </p>

        {/* Best for badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            className="px-2 py-1 rounded-full"
            style={{
              backgroundColor: tool.color.replace(")", " / 0.1)"),
              color: tool.color,
            }}
          >
            Best for: {tool.bestFor}
          </span>
        </div>
      </div>

      {/* Hover CTA */}
      <div className="relative px-6 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: tool.color }}
        >
          Learn more
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>

      {/* Border glow on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${tool.color.replace(")", " / 0.3)")}`,
        }}
      />
    </motion.div>
    </Link>
  );
}

interface CategorySectionProps {
  title: string;
  subtitle: string;
  tools: Tool[];
  categoryIndex: number;
}

function CategorySection({ title, subtitle, tools, categoryIndex }: CategorySectionProps) {
  return (
    <div className="mb-16">
      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: categoryIndex * 0.1 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <h3 className="text-2xl font-bold text-white mb-1 font-[family-name:var(--font-manrope)]">
          {title}
        </h3>
        <p className="text-slate-500">{subtitle}</p>
      </motion.div>

      {/* Tools Grid */}
      <div
        className={cn(
          "grid gap-4",
          tools.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        )}
      >
        {tools.map((tool, index) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            index={categoryIndex * tools.length + index}
            isLarge={tools.length === 2}
          />
        ))}
      </div>
    </div>
  );
}

export function BentoToolsSection() {
  return (
    <section
      id="tools"
      className="relative w-full bg-[hsl(var(--surface-dark))] py-24 px-6 overflow-hidden"
    >
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 max-w-3xl mx-auto"
      >
        <span className="text-sm uppercase tracking-widest text-[hsl(var(--brand-primary))] mb-4 block">
          The Toolkit
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-manrope)]">
          11 Tools for{" "}
          <span className="text-[hsl(var(--brand-accent))]">Every</span>{" "}
          Thinking Challenge
        </h2>
        <p className="text-lg text-slate-400">
          Grouped by what you&apos;re trying to accomplish, not technical jargon.
        </p>
      </motion.div>

      {/* Categories */}
      <div className="max-w-6xl mx-auto">
        {toolCategories.map((category, index) => (
          <CategorySection
            key={category.id}
            title={category.title}
            subtitle={category.subtitle}
            tools={category.tools}
            categoryIndex={index}
          />
        ))}
      </div>

      {/* Chain Tools Together CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        viewport={{ once: true }}
        className="text-center mt-8"
      >
        <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <span className="text-slate-400">Chain tools together:</span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-[hsl(var(--brand-accent)/0.15)] text-[hsl(var(--brand-accent))] text-sm font-medium">
              Council
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="px-3 py-1 rounded-lg bg-[hsl(45_93%_60%/0.15)] text-[hsl(45_93%_60%)] text-sm font-medium">
              Debate
            </span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <span className="px-3 py-1 rounded-lg bg-[hsl(280_60%_70%/0.15)] text-[hsl(280_60%_70%)] text-sm font-medium">
              Decide
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default BentoToolsSection;
