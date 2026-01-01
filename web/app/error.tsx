"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* Error icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[hsl(var(--brand-accent)/0.1)] border border-[hsl(var(--brand-accent)/0.2)] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[hsl(var(--brand-accent))]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
          Something Went Wrong
        </h2>
        <p className="text-lg text-slate-400 mb-8">
          We encountered an unexpected error. Please try again.
        </p>

        {/* Try Again Button */}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.85)] text-white font-semibold transition-all duration-300 shadow-[0_10px_25px_hsl(var(--brand-primary)/0.4)] hover:shadow-[0_15px_35px_hsl(var(--brand-primary)/0.5)]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
