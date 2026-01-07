"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FeedbackEntry,
  type FeedbackType,
  getFeedbackTypeLabel,
  getFeedbackTypeColor,
  getFeedbackTypeBgColor,
  formatDateTime,
  formatRelativeTime,
  formatDate,
} from "@/lib/feedback";

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the FeedbackDetail component
 */
export interface FeedbackDetailProps {
  /** The feedback entry to display */
  entry: FeedbackEntry | null;
  /** Whether the component is in a loading state */
  isLoading?: boolean;
  /** Callback when the back button is clicked */
  onBack?: () => void;
  /** Custom class name for the container */
  className?: string;
}

/**
 * Props for the FeedbackDetailHeader component
 */
export interface FeedbackDetailHeaderProps {
  /** Callback when back is clicked */
  onBack?: () => void;
  /** Optional title override */
  title?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Rating icon component for displaying thumbs up/down or issue report (larger version)
 */
function RatingIconLarge({ rating }: { rating: FeedbackType }) {
  const iconClasses = {
    "thumbs-up": "text-green-600",
    "thumbs-down": "text-red-600",
    "issue-report": "text-yellow-600",
  };

  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center ${getFeedbackTypeBgColor(rating)}`}
      aria-label={getFeedbackTypeLabel(rating)}
    >
      {rating === "thumbs-up" && (
        <svg
          className={`w-6 h-6 ${iconClasses[rating]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      )}
      {rating === "thumbs-down" && (
        <svg
          className={`w-6 h-6 ${iconClasses[rating]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      )}
      {rating === "issue-report" && (
        <svg
          className={`w-6 h-6 ${iconClasses[rating]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}

/**
 * Back navigation header component
 */
export function FeedbackDetailHeader({
  onBack,
  title = "Feedback Details",
}: FeedbackDetailHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
          aria-label="Go back to feedback list"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
      )}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
  );
}

/**
 * Metadata row component for displaying key-value pairs
 */
interface MetadataRowProps {
  label: string;
  value: string | React.ReactNode;
  copyable?: boolean;
}

function MetadataRow({ label, value, copyable = false }: MetadataRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-700/50 last:border-0">
      <span className="text-sm font-medium text-slate-400 sm:w-32 shrink-0">
        {label}
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-white break-all">{value}</span>
        {copyable && typeof value === "string" && (
          <button
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-white transition-colors shrink-0"
            aria-label={copied ? "Copied!" : `Copy ${label}`}
            title={copied ? "Copied!" : `Copy to clipboard`}
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Tool context section for displaying input/output context
 */
interface ToolContextSectionProps {
  toolContext: FeedbackEntry["toolContext"];
}

function ToolContextSection({ toolContext }: ToolContextSectionProps) {
  if (!toolContext) {
    return null;
  }

  const { input, outputSummary } = toolContext;
  const hasInput = input && Object.keys(input).length > 0;
  const hasOutput = outputSummary && outputSummary.trim().length > 0;

  if (!hasInput && !hasOutput) {
    return null;
  }

  return (
    <Card className="border-slate-700/50 bg-slate-800/30">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-400">
          Tool Invocation Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasInput && (
          <div>
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Input Parameters
            </h4>
            <pre className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-300 overflow-x-auto">
              <code>{JSON.stringify(input, null, 2)}</code>
            </pre>
          </div>
        )}
        {hasOutput && (
          <div>
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Output Summary
            </h4>
            <div className="p-3 bg-slate-900/50 rounded-lg text-sm text-slate-300 whitespace-pre-wrap">
              {outputSummary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for the feedback detail view
 */
export function FeedbackDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="w-40 h-6" />
      </div>

      {/* Main card skeleton */}
      <Card className="border-slate-700/50 bg-slate-800/30">
        <CardContent className="p-6">
          {/* Rating and tool header */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <Skeleton variant="circular" className="w-12 h-12" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>

          {/* Comment section */}
          <div className="mb-6">
            <Skeleton className="w-20 h-4 mb-3" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-full h-4 mb-2" />
            <Skeleton className="w-3/4 h-4" />
          </div>

          {/* Metadata section */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-slate-700/50 last:border-0">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-48 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Empty state when no feedback is selected
 */
export function FeedbackDetailEmpty({ onBack }: { onBack?: () => void }) {
  return (
    <div className="space-y-6">
      {onBack && (
        <FeedbackDetailHeader onBack={onBack} title="Feedback Details" />
      )}
      <Card className="border-slate-700/50 bg-slate-800/30">
        <CardContent className="p-12 text-center">
          <div className="text-6xl mb-4" aria-hidden="true">
            📋
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Feedback Selected
          </h3>
          <p className="text-slate-400">
            Select a feedback entry from the list to view its details.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              Return to List
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Feedback detail component for viewing a single feedback entry with full context.
 *
 * Features:
 * - Full feedback comment display (not truncated)
 * - Tool invocation context (input parameters and output summary)
 * - Complete metadata display (timestamps, IDs)
 * - Copy-to-clipboard for IDs
 * - Back navigation to list view
 * - Loading and empty states
 *
 * @example
 * ```tsx
 * <FeedbackDetail
 *   entry={selectedFeedback}
 *   onBack={() => setSelectedFeedback(null)}
 *   isLoading={isLoading}
 * />
 * ```
 */
export function FeedbackDetail({
  entry,
  isLoading = false,
  onBack,
  className = "",
}: FeedbackDetailProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <FeedbackDetailSkeleton />
      </div>
    );
  }

  // Empty state when no entry is provided
  if (!entry) {
    return (
      <div className={className}>
        <FeedbackDetailEmpty onBack={onBack} />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Navigation Header */}
      <FeedbackDetailHeader onBack={onBack} />

      {/* Main Feedback Card */}
      <Card className="border-slate-700/50 bg-slate-800/30 mb-6">
        <CardContent className="p-6">
          {/* Rating and Tool Header */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <RatingIconLarge rating={entry.rating} />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-white mb-1">
                {entry.toolName}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${getFeedbackTypeBgColor(entry.rating)} ${getFeedbackTypeColor(entry.rating)}`}
                >
                  {getFeedbackTypeLabel(entry.rating)}
                </span>
                <span
                  className="text-sm text-slate-400"
                  title={formatDateTime(entry.timestamp)}
                >
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-400 mb-3">
              Feedback Comment
            </h4>
            {entry.comment ? (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {entry.comment}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <p className="text-slate-500 italic">No comment was provided with this feedback.</p>
              </div>
            )}
          </div>

          {/* Metadata Section */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">
              Details
            </h4>
            <div className="bg-slate-900/30 rounded-lg px-4">
              <MetadataRow label="Feedback ID" value={entry.id} copyable />
              <MetadataRow
                label="Invocation ID"
                value={entry.invocationId}
                copyable
              />
              <MetadataRow label="Tool Name" value={entry.toolName} />
              <MetadataRow
                label="Rating Type"
                value={
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${getFeedbackTypeBgColor(entry.rating)} ${getFeedbackTypeColor(entry.rating)}`}
                  >
                    {getFeedbackTypeLabel(entry.rating)}
                  </span>
                }
              />
              <MetadataRow
                label="Submitted"
                value={formatDateTime(entry.timestamp)}
              />
              <MetadataRow
                label="Date"
                value={formatDate(entry.timestamp, { dateStyle: "full" })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Context Section (if available) */}
      {entry.toolContext && (
        <ToolContextSection toolContext={entry.toolContext} />
      )}

      {/* Back Navigation Footer */}
      {onBack && (
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Feedback List
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { RatingIconLarge, MetadataRow, ToolContextSection };
