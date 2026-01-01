"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const MCP_URL = "https://think-mcp.vercel.app/api/mcp";

// Client icons as simple SVG components
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

function ClaudeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

function CursorIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L9.32 14.93L3.94 18.22C3.49 18.5 2.9 18.38 2.61 17.93C2.46 17.7 2.41 17.42 2.47 17.15L5.47 3.15C5.58 2.64 6.08 2.31 6.59 2.42C6.83 2.47 7.04 2.61 7.18 2.81L19.18 20.31C19.46 20.73 19.35 21.3 18.93 21.58C18.7 21.73 18.43 21.78 18.17 21.72L13.64 21.97Z" />
    </svg>
  );
}

function VSCodeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M17.583 2.833L11.167 8.5L6.833 5L4.5 6.167L8.083 10L4.5 13.833L6.833 15L11.167 11.5L17.583 17.167V2.833zM17.583 5.667V14.333L13.083 10L17.583 5.667z" />
    </svg>
  );
}

function WindsurfIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M3 17h18v2H3v-2zm0-7h18v2H3v-2zm0-7h18v2H3V3z" />
    </svg>
  );
}

const clients = [
  { name: "Claude Desktop", icon: ClaudeIcon, color: "hsl(var(--brand-accent))" },
  { name: "Cursor", icon: CursorIcon, color: "hsl(var(--brand-primary))" },
  { name: "VS Code", icon: VSCodeIcon, color: "hsl(200 70% 60%)" },
  { name: "Windsurf", icon: WindsurfIcon, color: "hsl(159 43% 70%)" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
        "bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50",
        copied && "bg-green-900/30 border-green-500/50"
      )}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm font-medium">Copy</span>
        </>
      )}
    </button>
  );
}

export function InstallSection() {
  return (
    <section
      id="install"
      className="relative w-full bg-[hsl(var(--surface-dark))] py-24 px-6 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(var(--brand-primary)/0.03)] to-transparent" />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm uppercase tracking-widest text-[hsl(var(--brand-primary))] mb-4 block">
            Get Started
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-[family-name:var(--font-manrope)]">
            One URL.{" "}
            <span className="text-[hsl(var(--brand-accent))]">Zero Setup.</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Add Think to any MCP-compatible client in seconds. No installation, no dependencies, no configuration.
          </p>
        </motion.div>

        {/* Install Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(var(--brand-primary)/0.3)] via-[hsl(var(--brand-accent)/0.3)] to-[hsl(var(--brand-primary)/0.3)] rounded-2xl blur-xl opacity-50" />

          {/* Card */}
          <div className="relative bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 md:p-10">
            {/* Terminal header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Terminal className="w-4 h-4" />
                <span>MCP Server URL</span>
              </div>
            </div>

            {/* URL display */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8">
              <div className="flex-1 bg-slate-950/50 rounded-lg px-5 py-4 border border-slate-700/30 overflow-x-auto">
                <code className="text-[hsl(var(--brand-primary))] text-sm md:text-base font-mono whitespace-nowrap">
                  {MCP_URL}
                </code>
              </div>
              <CopyButton text={MCP_URL} />
            </div>

            {/* Quick setup hint */}
            <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <Sparkles className="w-5 h-5 text-[hsl(var(--brand-accent))] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-400">
                <span className="text-slate-300 font-medium">Pro tip:</span>{" "}
                In Claude Desktop, go to Settings → Developer → Add MCP Server → paste the URL above.
                That&apos;s it—all 11 tools are now available.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Client compatibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 mb-6 uppercase tracking-wider">
            Works with any MCP-compatible client
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {clients.map((client, index) => {
              const Icon = client.icon;
              return (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${client.color.replace(")", " / 0.1)")}`,
                    }}
                  >
                    <Icon
                      className="w-7 h-7 transition-colors duration-300"
                      style={{ color: client.color }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                    {client.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-slate-500">
            Questions?{" "}
            <a
              href="https://github.com/letsgomaslow/think-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--brand-primary))] hover:underline"
            >
              Check the GitHub repo
            </a>{" "}
            or{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--brand-primary))] hover:underline"
            >
              learn about MCP
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default InstallSection;
