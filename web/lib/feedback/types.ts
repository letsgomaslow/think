/**
 * Feedback Data Types
 *
 * Type definitions for feedback API responses and data processing.
 * These types match the API endpoints at /api/feedback and /api/feedback/summary.
 */

/**
 * Type of feedback that can be submitted
 */
export type FeedbackType = 'thumbs-up' | 'thumbs-down' | 'issue-report';

/**
 * All valid feedback types as an array (for validation)
 */
export const FEEDBACK_TYPES: FeedbackType[] = ['thumbs-up', 'thumbs-down', 'issue-report'];

/**
 * Feedback entry as returned from the API
 * Matches FeedbackEntry from src/models/interfaces.ts
 */
export interface FeedbackEntry {
  /** Unique identifier for this feedback entry */
  id: string;
  /** The type of feedback */
  rating: FeedbackType;
  /** Optional text comment with detailed feedback */
  comment?: string;
  /** Name of the tool this feedback is for */
  toolName: string;
  /** ISO 8601 timestamp when feedback was submitted */
  timestamp: string;
  /** Unique identifier for the specific tool invocation */
  invocationId: string;
  /** Optional tool output context for reference */
  toolContext?: {
    /** The input parameters that were passed to the tool */
    input?: Record<string, unknown>;
    /** Summary or excerpt of the tool output */
    outputSummary?: string;
  };
}

/**
 * Pagination information included in list responses
 */
export interface PaginationInfo {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of entries per page */
  limit: number;
  /** Total number of entries matching the filter */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages available */
  hasMore: boolean;
}

/**
 * Active filters in a feedback list request
 */
export interface FeedbackFilters {
  /** Filter by tool name */
  tool?: string;
  /** Filter by rating type */
  rating?: FeedbackType;
  /** Filter entries from this date (ISO 8601) */
  startDate?: string;
  /** Filter entries until this date (ISO 8601) */
  endDate?: string;
}

/**
 * API response from GET /api/feedback
 */
export interface FeedbackListResponse {
  /** Array of feedback entries */
  data: FeedbackEntry[];
  /** Pagination information */
  pagination: PaginationInfo;
  /** Currently applied filters */
  filters: FeedbackFilters;
}

/**
 * Rating counts for feedback statistics
 */
export interface RatingCounts {
  'thumbs-up': number;
  'thumbs-down': number;
  'issue-report': number;
}

/**
 * Rating percentages (0-100)
 */
export interface RatingPercentages {
  'thumbs-up': number;
  'thumbs-down': number;
  'issue-report': number;
}

/**
 * Per-tool breakdown with rating counts
 */
export interface ToolBreakdown {
  /** Name of the tool */
  toolName: string;
  /** Total feedback count for this tool */
  total: number;
  /** Rating counts by type */
  ratings: RatingCounts;
}

/**
 * Trend data point for a specific time period (day or week)
 */
export interface TrendDataPoint {
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Total feedback count for this period */
  total: number;
  /** Rating counts by type for this period */
  ratings: RatingCounts;
}

/**
 * Time range for feedback data
 */
export interface TimeRange {
  /** Earliest feedback timestamp (ISO 8601) or null if no feedback */
  earliest: string | null;
  /** Latest feedback timestamp (ISO 8601) or null if no feedback */
  latest: string | null;
}

/**
 * API response from GET /api/feedback/summary
 */
export interface FeedbackSummaryResponse {
  /** Total number of feedback entries */
  totalFeedback: number;
  /** Count of feedback by rating type */
  ratingCounts: RatingCounts;
  /** Percentage of feedback by rating type (0-100) */
  ratingPercentages: RatingPercentages;
  /** Breakdown of feedback by tool */
  toolBreakdown: ToolBreakdown[];
  /** Trend data over time */
  trends: {
    /** Daily trend data points */
    daily: TrendDataPoint[];
    /** Weekly trend data points */
    weekly: TrendDataPoint[];
  };
  /** Time range of feedback data */
  timeRange: TimeRange;
}

/**
 * API error response format
 */
export interface FeedbackApiError {
  /** Error message */
  error: string;
  /** Additional error details */
  details?: string;
}

/**
 * Query parameters for the feedback list API
 */
export interface FeedbackListParams {
  /** Filter by tool name */
  tool?: string;
  /** Filter by rating type */
  rating?: FeedbackType;
  /** Filter entries from this date (ISO 8601) */
  startDate?: string;
  /** Filter entries until this date (ISO 8601) */
  endDate?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Entries per page (default: 20, max: 100) */
  limit?: number;
  /** Sort order by timestamp (default: 'desc') */
  sort?: 'asc' | 'desc';
}

/**
 * Query parameters for the feedback summary API
 */
export interface FeedbackSummaryParams {
  /** Number of days for daily trend (default: 30, max: 90) */
  days?: number;
  /** Number of weeks for weekly trend (default: 12, max: 52) */
  weeks?: number;
}
