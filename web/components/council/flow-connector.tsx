"use client";

import { motion } from "framer-motion";

interface FlowConnectorProps {
  fromColor: string;
  toColor: string;
  delay?: number;
}

/**
 * Visual connector between contribution cards showing conversation flow/handoff.
 * Renders a curved line with gradient from one persona color to another.
 */
export function FlowConnector({ fromColor, toColor, delay = 0 }: FlowConnectorProps) {
  return (
    <div className="relative h-8 w-full flex items-center justify-start pl-[22px]">
      {/* SVG curved connector */}
      <svg
        className="absolute left-[22px] top-0 h-8 w-16 overflow-visible"
        viewBox="0 0 64 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`flow-gradient-${delay}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Curved path from top to bottom with slight S-curve */}
        <motion.path
          d="M 4 0 Q 4 8, 12 16 Q 20 24, 4 32"
          stroke={`url(#flow-gradient-${delay})`}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: delay, duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        />

        {/* Small dot at the end (handoff point) */}
        <motion.circle
          cx="4"
          cy="32"
          r="3"
          fill={toColor}
          fillOpacity="0.5"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.2 }}
          viewport={{ once: true }}
        />
      </svg>
    </div>
  );
}

export default FlowConnector;
