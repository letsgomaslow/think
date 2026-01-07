"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FeedbackEntry,
  type FeedbackType,
  FEEDBACK_TYPES,
  getFeedbackTypeLabel,
  getFeedbackTypeColor,
  getFeedbackTypeBgColor,
  formatRelativeTime,
  formatDateTime,
  truncateComment,
} from "@/lib/feedback";

/**
 * Rating icon component for displaying thumbs up/down or issue report
 */
function RatingIcon({ rating }: { rating: FeedbackType }) {
  const iconClasses = {
    "thumbs-up": "text-green-600",
    "thumbs-down": "text-red-600",
    "issue-report": "text-yellow-600",
  };

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${getFeedbackTypeBgColor(rating)}`}
    >
      {rating === "thumbs-up" && (
        <svg
          className={`w-4 h-4 ${iconClasses[rating]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      )}
      {rating === "thumbs-down" && (
        <svg
          className={`w-4 h-4 ${iconClasses[rating]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      )}
      {rating === "issue-report" && (
        <svg
          className={`w-4 h-4 ${iconClasses[rating]}`}
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
 * Props for the FeedbackFilters component
 */
export interface FeedbackFiltersProps {
  /** Available tool names for filtering */
  toolNames: string[];
  /** Currently selected tool filter */
  selectedTool: string;
  /** Callback when tool filter changes */
  onToolChange: (tool: string) => void;
  /** Currently selected rating filter */
  selectedRating: FeedbackType | "";
  /** Callback when rating filter changes */
  onRatingChange: (rating: FeedbackType | "") => void;
  /** Optional start date filter */
  startDate?: string;
  /** Callback when start date changes */
  onStartDateChange?: (date: string) => void;
  /** Optional end date filter */
  endDate?: string;
  /** Callback when end date changes */
  onEndDateChange?: (date: string) => void;
  /** Current sort order */
  sortOrder: "asc" | "desc";
  /** Callback when sort order changes */
  onSortChange: (order: "asc" | "desc") => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Filters component for the feedback list
 */
export function FeedbackFilters({
  toolNames,
  selectedTool,
  onToolChange,
  selectedRating,
  onRatingChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortOrder,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: FeedbackFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Main Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Tool Filter */}
        <select
          value={selectedTool}
          onChange={(e) => onToolChange(e.target.value)}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Filter by tool"
        >
          <option value="">All Tools</option>
          {toolNames.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={selectedRating}
          onChange={(e) => onRatingChange(e.target.value as FeedbackType | "")}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Filter by rating"
        >
          <option value="">All Ratings</option>
          {FEEDBACK_TYPES.map((type) => (
            <option key={type} value={type}>
              {getFeedbackTypeLabel(type)}
            </option>
          ))}
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as "asc" | "desc")}
          className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label="Sort order"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Date Range Filters (if handlers provided) */}
      {(onStartDateChange || onEndDateChange) && (
        <div className="flex flex-wrap gap-3 items-center">
          {onStartDateChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-sm text-slate-400">
                From:
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate || ""}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
          {onEndDateChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-sm text-slate-400">
                To:
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate || ""}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          )}
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedTool && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded flex items-center gap-1">
              Tool: {selectedTool}
              <button
                onClick={() => onToolChange("")}
                className="hover:text-white ml-1"
                aria-label={`Remove tool filter: ${selectedTool}`}
              >
                &times;
              </button>
            </span>
          )}
          {selectedRating && (
            <span
              className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${getFeedbackTypeBgColor(selectedRating)} ${getFeedbackTypeColor(selectedRating)}`}
            >
              {getFeedbackTypeLabel(selectedRating)}
              <button
                onClick={() => onRatingChange("")}
                className="hover:opacity-70 ml-1"
                aria-label={`Remove rating filter: ${selectedRating}`}
              >
                &times;
              </button>
            </span>
          )}
          {startDate && (
            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded flex items-center gap-1">
              From: {startDate}
              {onStartDateChange && (
                <button
                  onClick={() => onStartDateChange("")}
                  className="hover:text-white ml-1"
                  aria-label="Remove start date filter"
                >
                  &times;
                </button>
              )}
            </span>
          )}
          {endDate && (
            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded flex items-center gap-1">
              To: {endDate}
              {onEndDateChange && (
                <button
                  onClick={() => onEndDateChange("")}
                  className="hover:text-white ml-1"
                  aria-label="Remove end date filter"
                >
                  &times;
                </button>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Props for the FeedbackListItem component
 */
export interface FeedbackListItemProps {
  /** The feedback entry to display */
  entry: FeedbackEntry;
  /** Maximum comment length before truncation */
  maxCommentLength?: number;
  /** Whether to show the full timestamp instead of relative time */
  showFullTimestamp?: boolean;
  /** Callback when the item is clicked */
  onClick?: (entry: FeedbackEntry) => void;
}

/**
 * Individual feedback list item component
 */
export function FeedbackListItem({
  entry,
  maxCommentLength = 200,
  showFullTimestamp = false,
  onClick,
}: FeedbackListItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(entry);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(entry);
    }
  };

  return (
    <Card
      className={`border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `View feedback details for ${entry.toolName}` : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <RatingIcon rating={entry.rating} />
            <span className="font-medium text-white">{entry.toolName}</span>
          </div>
          <span className="text-sm text-slate-500" title={formatDateTime(entry.timestamp)}>
            {showFullTimestamp
              ? formatDateTime(entry.timestamp)
              : formatRelativeTime(entry.timestamp)}
          </span>
        </div>
        {entry.comment ? (
          <p className="text-slate-300">
            {truncateComment(entry.comment, maxCommentLength)}
          </p>
        ) : (
          <p className="text-slate-500 italic">No comment provided</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span title={`Full ID: ${entry.invocationId}`}>
            ID: {entry.invocationId.slice(0, 8)}...
          </span>
          <span
            className={`px-2 py-0.5 rounded ${getFeedbackTypeBgColor(entry.rating)} ${getFeedbackTypeColor(entry.rating)}`}
          >
            {getFeedbackTypeLabel(entry.rating)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for feedback list items
 */
export function FeedbackListItemSkeleton() {
  return (
    <Card className="border-slate-700/50 bg-slate-800/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-8 h-8" />
            <Skeleton className="w-24 h-5" />
          </div>
          <Skeleton className="w-28 h-4" />
        </div>
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4" />
      </CardContent>
    </Card>
  );
}

/**
 * Props for the FeedbackPagination component
 */
export interface FeedbackPaginationProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
}

/**
 * Pagination component for the feedback list
 */
export function FeedbackPagination({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
}: FeedbackPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-slate-400">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={!hasMore}
        className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
}

/**
 * Props for the FeedbackEmptyState component
 */
export interface FeedbackEmptyStateProps {
  /** Whether filters are active */
  hasFilters: boolean;
  /** Callback to clear filters */
  onClearFilters?: () => void;
}

/**
 * Empty state component when no feedback entries are found
 */
export function FeedbackEmptyState({
  hasFilters,
  onClearFilters,
}: FeedbackEmptyStateProps) {
  return (
    <Card className="border-slate-700/50 bg-slate-800/30">
      <CardContent className="p-12 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          {hasFilters ? "🔍" : "📬"}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {hasFilters ? "No Matching Feedback" : "No Feedback Yet"}
        </h3>
        <p className="text-slate-400">
          {hasFilters
            ? "No feedback matches the current filters. Try adjusting your filters."
            : "Feedback submitted through the MCP feedback tool will appear here."}
        </p>
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Props for the main FeedbackList component
 */
export interface FeedbackListProps {
  /** Array of feedback entries to display */
  entries: FeedbackEntry[];
  /** Whether the list is currently loading */
  isLoading?: boolean;
  /** Available tool names for filtering */
  toolNames?: string[];
  /** Current pagination state */
  pagination?: {
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
  /** Currently applied filters */
  filters?: {
    tool: string;
    rating: FeedbackType | "";
    startDate?: string;
    endDate?: string;
  };
  /** Current sort order */
  sortOrder?: "asc" | "desc";
  /** Callback when tool filter changes */
  onToolFilterChange?: (tool: string) => void;
  /** Callback when rating filter changes */
  onRatingFilterChange?: (rating: FeedbackType | "") => void;
  /** Callback when start date filter changes */
  onStartDateChange?: (date: string) => void;
  /** Callback when end date filter changes */
  onEndDateChange?: (date: string) => void;
  /** Callback when sort order changes */
  onSortChange?: (order: "asc" | "desc") => void;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when feedback item is clicked */
  onItemClick?: (entry: FeedbackEntry) => void;
  /** Number of skeleton items to show when loading */
  loadingSkeletonCount?: number;
  /** Maximum comment length before truncation */
  maxCommentLength?: number;
  /** Whether to show full timestamps */
  showFullTimestamp?: boolean;
  /** Whether to show filters */
  showFilters?: boolean;
  /** Custom title for the list section */
  title?: string;
}

/**
 * Main feedback list component with filtering, sorting, and pagination
 *
 * Displays a list of feedback entries with options for:
 * - Filtering by tool, rating type, and date range
 * - Sorting by date (newest/oldest first)
 * - Pagination for large result sets
 * - Loading states with skeletons
 * - Empty states for no results
 */
export function FeedbackList({
  entries,
  isLoading = false,
  toolNames = [],
  pagination,
  filters = { tool: "", rating: "" },
  sortOrder = "desc",
  onToolFilterChange,
  onRatingFilterChange,
  onStartDateChange,
  onEndDateChange,
  onSortChange,
  onPageChange,
  onItemClick,
  loadingSkeletonCount = 5,
  maxCommentLength = 200,
  showFullTimestamp = false,
  showFilters = true,
  title = "Feedback",
}: FeedbackListProps) {
  const hasActiveFilters = Boolean(
    filters.tool || filters.rating || filters.startDate || filters.endDate
  );

  const handleClearFilters = () => {
    onToolFilterChange?.("");
    onRatingFilterChange?.("");
    onStartDateChange?.("");
    onEndDateChange?.("");
  };

  return (
    <section>
      {/* Header with Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>

          {(onToolFilterChange || onRatingFilterChange || onSortChange) && (
            <FeedbackFilters
              toolNames={toolNames}
              selectedTool={filters.tool}
              onToolChange={onToolFilterChange || (() => {})}
              selectedRating={filters.rating}
              onRatingChange={onRatingFilterChange || (() => {})}
              startDate={filters.startDate}
              onStartDateChange={onStartDateChange}
              endDate={filters.endDate}
              onEndDateChange={onEndDateChange}
              sortOrder={sortOrder}
              onSortChange={onSortChange || (() => {})}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4" role="status" aria-label="Loading feedback entries">
          {Array.from({ length: loadingSkeletonCount }, (_, i) => (
            <FeedbackListItemSkeleton key={i} />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <>
          {/* Feedback List */}
          <div className="space-y-4" role="list" aria-label="Feedback entries">
            {entries.map((entry) => (
              <FeedbackListItem
                key={entry.id}
                entry={entry}
                maxCommentLength={maxCommentLength}
                showFullTimestamp={showFullTimestamp}
                onClick={onItemClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && onPageChange && (
            <FeedbackPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasMore={pagination.hasMore}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : (
        /* Empty State */
        <FeedbackEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
        />
      )}
    </section>
  );
}
