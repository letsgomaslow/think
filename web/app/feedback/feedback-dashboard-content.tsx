"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FeedbackListResponse,
  type FeedbackSummaryResponse,
  type FeedbackType,
  type FeedbackListParams,
  FEEDBACK_TYPES,
  getFeedbackTypeLabel,
  getFeedbackTypeColor,
  getFeedbackTypeBgColor,
  formatRelativeTime,
  truncateComment,
  buildFeedbackListUrl,
  buildFeedbackSummaryUrl,
} from "@/lib/feedback";

/**
 * Main content component for the feedback dashboard.
 * Fetches data from API and renders stats and feedback list.
 * Individual components (FeedbackList, FeedbackStats, FeedbackDetail)
 * will be extracted in subsequent subtasks.
 */
export function FeedbackDashboardContent() {
  const [summary, setSummary] = useState<FeedbackSummaryResponse | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackListResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterTool, setFilterTool] = useState<string>("");
  const [filterRating, setFilterRating] = useState<FeedbackType | "">("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const url = buildFeedbackSummaryUrl("/api/feedback/summary", {
          days: 30,
          weeks: 12,
        });
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch summary: ${response.statusText}`);
        }
        const data: FeedbackSummaryResponse = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load summary");
      } finally {
        setIsLoadingSummary(false);
      }
    };

    fetchSummary();
  }, []);

  // Fetch feedback list data
  useEffect(() => {
    const fetchFeedbackList = async () => {
      setIsLoadingList(true);
      try {
        const params: FeedbackListParams = {
          page: currentPage,
          limit: 20,
          sort: "desc",
        };
        if (filterTool) params.tool = filterTool;
        if (filterRating) params.rating = filterRating;

        const url = buildFeedbackListUrl("/api/feedback", params);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch feedback: ${response.statusText}`);
        }
        const data: FeedbackListResponse = await response.json();
        setFeedbackList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load feedback");
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchFeedbackList();
  }, [currentPage, filterTool, filterRating]);

  // Handle filter changes
  const handleToolFilterChange = (tool: string) => {
    setFilterTool(tool);
    setCurrentPage(1);
  };

  const handleRatingFilterChange = (rating: FeedbackType | "") => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-slate-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Feedback Dashboard</h1>
        <p className="text-lg text-slate-400">
          Review user feedback on Think MCP tools. Track ratings, comments, and
          issue reports to continuously improve tool quality.
        </p>
      </header>

      {/* Stats Cards Section */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Overview</h2>
        {isLoadingSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-slate-700/50 bg-slate-800/30">
                <CardContent className="p-6">
                  <Skeleton className="w-24 h-4 mb-3" />
                  <Skeleton className="w-16 h-8 mb-2" />
                  <Skeleton className="w-20 h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Feedback */}
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {summary.totalFeedback}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.toolBreakdown.length} tools
                </p>
              </CardContent>
            </Card>

            {/* Positive Feedback */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">
                  Positive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {summary.ratingCounts["thumbs-up"]}
                </div>
                <p className="text-xs text-green-500/70 mt-1">
                  {summary.ratingPercentages["thumbs-up"]}% of total
                </p>
              </CardContent>
            </Card>

            {/* Negative Feedback */}
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400">
                  Negative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400">
                  {summary.ratingCounts["thumbs-down"]}
                </div>
                <p className="text-xs text-red-500/70 mt-1">
                  {summary.ratingPercentages["thumbs-down"]}% of total
                </p>
              </CardContent>
            </Card>

            {/* Issue Reports */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400">
                  Issue Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400">
                  {summary.ratingCounts["issue-report"]}
                </div>
                <p className="text-xs text-yellow-500/70 mt-1">
                  {summary.ratingPercentages["issue-report"]}% of total
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      {/* Tool Breakdown Section */}
      {summary && summary.toolBreakdown.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Feedback by Tool
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.toolBreakdown.map((tool) => (
              <Card
                key={tool.toolName}
                className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handleToolFilterChange(tool.toolName)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{tool.toolName}</span>
                    <span className="text-sm text-slate-400">{tool.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-green-400">
                      +{tool.ratings["thumbs-up"]}
                    </span>
                    <span className="text-xs text-red-400">
                      -{tool.ratings["thumbs-down"]}
                    </span>
                    <span className="text-xs text-yellow-400">
                      !{tool.ratings["issue-report"]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Feedback List Section */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Feedback</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Tool Filter */}
            <select
              value={filterTool}
              onChange={(e) => handleToolFilterChange(e.target.value)}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Tools</option>
              {summary?.toolBreakdown.map((tool) => (
                <option key={tool.toolName} value={tool.toolName}>
                  {tool.toolName}
                </option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) =>
                handleRatingFilterChange(e.target.value as FeedbackType | "")
              }
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Ratings</option>
              {FEEDBACK_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getFeedbackTypeLabel(type)}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {(filterTool || filterRating) && (
              <button
                onClick={() => {
                  setFilterTool("");
                  setFilterRating("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(filterTool || filterRating) && (
          <div className="flex gap-2 mb-4">
            {filterTool && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                Tool: {filterTool}
              </span>
            )}
            {filterRating && (
              <span
                className={`px-2 py-1 text-xs rounded ${getFeedbackTypeBgColor(
                  filterRating
                )} ${getFeedbackTypeColor(filterRating)}`}
              >
                {getFeedbackTypeLabel(filterRating)}
              </span>
            )}
          </div>
        )}

        {/* Feedback List */}
        {isLoadingList ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-slate-700/50 bg-slate-800/30">
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
            ))}
          </div>
        ) : feedbackList && feedbackList.data.length > 0 ? (
          <>
            <div className="space-y-4">
              {feedbackList.data.map((entry) => (
                <Card
                  key={entry.id}
                  className="border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Rating Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${getFeedbackTypeBgColor(
                            entry.rating
                          )}`}
                        >
                          {entry.rating === "thumbs-up" && (
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                          )}
                          {entry.rating === "thumbs-down" && (
                            <svg
                              className="w-4 h-4 text-red-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                          )}
                          {entry.rating === "issue-report" && (
                            <svg
                              className="w-4 h-4 text-yellow-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-white">
                          {entry.toolName}
                        </span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                    {entry.comment ? (
                      <p className="text-slate-300">
                        {truncateComment(entry.comment, 200)}
                      </p>
                    ) : (
                      <p className="text-slate-500 italic">No comment provided</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>ID: {entry.invocationId.slice(0, 8)}...</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {feedbackList.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-400">
                  Page {feedbackList.pagination.page} of{" "}
                  {feedbackList.pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(feedbackList.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={!feedbackList.pagination.hasMore}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Feedback Yet
              </h3>
              <p className="text-slate-400">
                {filterTool || filterRating
                  ? "No feedback matches the current filters. Try adjusting your filters."
                  : "Feedback submitted through the MCP feedback tool will appear here."}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
