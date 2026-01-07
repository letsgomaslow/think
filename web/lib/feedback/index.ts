/**
 * Feedback Utilities Module
 *
 * Utility functions for feedback data processing, aggregation, and date formatting.
 * Used by the feedback dashboard UI components.
 */

export * from './types';

import type {
  FeedbackEntry,
  FeedbackType,
  FeedbackListParams,
  FeedbackSummaryParams,
  RatingCounts,
  RatingPercentages,
  ToolBreakdown,
  TrendDataPoint,
} from './types';

// ============================================================================
// Date Formatting Helpers
// ============================================================================

/**
 * Formats an ISO 8601 date string to a localized date string
 * @param isoString - ISO 8601 date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, options);
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO 8601 date string to a localized time string
 * @param isoString - ISO 8601 date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted time string
 */
export function formatTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { timeStyle: 'short' }
): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, options);
  } catch {
    return isoString;
  }
}

/**
 * Formats an ISO 8601 date string to a localized date and time string
 * @param isoString - ISO 8601 date string
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date and time string
 */
export function formatDateTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, options);
  } catch {
    return isoString;
  }
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param isoString - ISO 8601 date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else if (diffWeek < 4) {
      return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
    } else if (diffMonth < 12) {
      return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
    } else {
      return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
    }
  } catch {
    return isoString;
  }
}

/**
 * Formats a date string to YYYY-MM-DD format
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Gets the Monday of the week for a given date (for weekly aggregation)
 * @param date - Date object or ISO string
 * @returns Date string in YYYY-MM-DD format for the Monday of that week
 */
export function getWeekStart(date: Date | string): string {
  const d = new Date(typeof date === 'string' ? date : date.toISOString());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return formatDateKey(d);
}

// ============================================================================
// Data Aggregation Utilities
// ============================================================================

/**
 * Creates an empty rating counts object
 * @returns RatingCounts with all values set to 0
 */
export function createEmptyRatingCounts(): RatingCounts {
  return {
    'thumbs-up': 0,
    'thumbs-down': 0,
    'issue-report': 0,
  };
}

/**
 * Calculates rating counts from an array of feedback entries
 * @param entries - Array of feedback entries
 * @returns RatingCounts object
 */
export function calculateRatingCounts(entries: FeedbackEntry[]): RatingCounts {
  const counts = createEmptyRatingCounts();
  for (const entry of entries) {
    counts[entry.rating]++;
  }
  return counts;
}

/**
 * Calculates rating percentages from rating counts
 * @param counts - Rating counts object
 * @param total - Total number of entries (defaults to sum of counts)
 * @returns RatingPercentages object with values 0-100
 */
export function calculateRatingPercentages(
  counts: RatingCounts,
  total?: number
): RatingPercentages {
  const totalCount = total ?? (counts['thumbs-up'] + counts['thumbs-down'] + counts['issue-report']);
  if (totalCount === 0) {
    return { 'thumbs-up': 0, 'thumbs-down': 0, 'issue-report': 0 };
  }
  return {
    'thumbs-up': Math.round((counts['thumbs-up'] / totalCount) * 100),
    'thumbs-down': Math.round((counts['thumbs-down'] / totalCount) * 100),
    'issue-report': Math.round((counts['issue-report'] / totalCount) * 100),
  };
}

/**
 * Calculates the satisfaction rate (positive / (positive + negative)) as a percentage
 * Excludes issue reports from the calculation
 * @param counts - Rating counts object
 * @returns Satisfaction rate 0-100, or null if no positive/negative feedback
 */
export function calculateSatisfactionRate(counts: RatingCounts): number | null {
  const positive = counts['thumbs-up'];
  const negative = counts['thumbs-down'];
  const total = positive + negative;
  if (total === 0) {
    return null;
  }
  return Math.round((positive / total) * 100);
}

/**
 * Aggregates feedback entries by tool name
 * @param entries - Array of feedback entries
 * @returns Array of ToolBreakdown objects sorted by total (descending)
 */
export function aggregateByTool(entries: FeedbackEntry[]): ToolBreakdown[] {
  const toolData: Map<string, ToolBreakdown> = new Map();

  for (const entry of entries) {
    if (!toolData.has(entry.toolName)) {
      toolData.set(entry.toolName, {
        toolName: entry.toolName,
        total: 0,
        ratings: createEmptyRatingCounts(),
      });
    }

    const breakdown = toolData.get(entry.toolName)!;
    breakdown.total++;
    breakdown.ratings[entry.rating]++;
  }

  // Convert to array and sort by total (descending)
  return Array.from(toolData.values()).sort((a, b) => b.total - a.total);
}

/**
 * Aggregates feedback entries by day
 * @param entries - Array of feedback entries
 * @param days - Number of days to include (default: 30)
 * @returns Array of TrendDataPoint objects sorted by date (ascending)
 */
export function aggregateByDay(
  entries: FeedbackEntry[],
  days: number = 30
): TrendDataPoint[] {
  const dailyData: Map<string, TrendDataPoint> = new Map();
  const today = new Date();

  // Initialize last N days with empty data
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = formatDateKey(date);
    dailyData.set(dateKey, {
      date: dateKey,
      total: 0,
      ratings: createEmptyRatingCounts(),
    });
  }

  // Aggregate entries by day
  for (const entry of entries) {
    const dateKey = formatDateKey(entry.timestamp);

    if (dailyData.has(dateKey)) {
      const dataPoint = dailyData.get(dateKey)!;
      dataPoint.total++;
      dataPoint.ratings[entry.rating]++;
    }
  }

  // Convert to sorted array
  return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregates feedback entries by week
 * @param entries - Array of feedback entries
 * @param weeks - Number of weeks to include (default: 12)
 * @returns Array of TrendDataPoint objects sorted by date (ascending)
 */
export function aggregateByWeek(
  entries: FeedbackEntry[],
  weeks: number = 12
): TrendDataPoint[] {
  const weeklyData: Map<string, TrendDataPoint> = new Map();
  const today = new Date();

  // Initialize last N weeks with empty data
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));
    const weekKey = getWeekStart(date);
    weeklyData.set(weekKey, {
      date: weekKey,
      total: 0,
      ratings: createEmptyRatingCounts(),
    });
  }

  // Aggregate entries by week
  for (const entry of entries) {
    const weekKey = getWeekStart(entry.timestamp);

    if (weeklyData.has(weekKey)) {
      const dataPoint = weeklyData.get(weekKey)!;
      dataPoint.total++;
      dataPoint.ratings[entry.rating]++;
    }
  }

  // Convert to sorted array
  return Array.from(weeklyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Filtering and Sorting Utilities
// ============================================================================

/**
 * Filters feedback entries by the given criteria
 * @param entries - Array of feedback entries
 * @param filters - Filter criteria
 * @returns Filtered array of feedback entries
 */
export function filterFeedback(
  entries: FeedbackEntry[],
  filters: {
    tool?: string;
    rating?: FeedbackType;
    startDate?: string;
    endDate?: string;
  }
): FeedbackEntry[] {
  let result = entries;

  if (filters.tool) {
    result = result.filter(entry => entry.toolName === filters.tool);
  }

  if (filters.rating) {
    result = result.filter(entry => entry.rating === filters.rating);
  }

  if (filters.startDate) {
    const startTime = new Date(filters.startDate).getTime();
    result = result.filter(entry => new Date(entry.timestamp).getTime() >= startTime);
  }

  if (filters.endDate) {
    const endTime = new Date(filters.endDate).getTime();
    result = result.filter(entry => new Date(entry.timestamp).getTime() <= endTime);
  }

  return result;
}

/**
 * Sorts feedback entries by timestamp
 * @param entries - Array of feedback entries
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array of feedback entries (new array)
 */
export function sortFeedbackByDate(
  entries: FeedbackEntry[],
  order: 'asc' | 'desc' = 'desc'
): FeedbackEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return order === 'asc' ? timeA - timeB : timeB - timeA;
  });
}

/**
 * Paginates feedback entries
 * @param entries - Array of feedback entries
 * @param page - Page number (1-indexed)
 * @param limit - Number of entries per page
 * @returns Paginated array of feedback entries
 */
export function paginateFeedback(
  entries: FeedbackEntry[],
  page: number = 1,
  limit: number = 20
): FeedbackEntry[] {
  const startIndex = (page - 1) * limit;
  return entries.slice(startIndex, startIndex + limit);
}

// ============================================================================
// API URL Builders
// ============================================================================

/**
 * Builds a URL with query parameters for the feedback list API
 * @param baseUrl - Base URL for the API (e.g., '/api/feedback')
 * @param params - Query parameters
 * @returns URL string with query parameters
 */
export function buildFeedbackListUrl(
  baseUrl: string,
  params: FeedbackListParams
): string {
  const url = new URL(baseUrl, 'http://placeholder');

  if (params.tool) url.searchParams.set('tool', params.tool);
  if (params.rating) url.searchParams.set('rating', params.rating);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);
  if (params.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params.limit !== undefined) url.searchParams.set('limit', String(params.limit));
  if (params.sort) url.searchParams.set('sort', params.sort);

  return `${baseUrl}${url.search}`;
}

/**
 * Builds a URL with query parameters for the feedback summary API
 * @param baseUrl - Base URL for the API (e.g., '/api/feedback/summary')
 * @param params - Query parameters
 * @returns URL string with query parameters
 */
export function buildFeedbackSummaryUrl(
  baseUrl: string,
  params: FeedbackSummaryParams
): string {
  const url = new URL(baseUrl, 'http://placeholder');

  if (params.days !== undefined) url.searchParams.set('days', String(params.days));
  if (params.weeks !== undefined) url.searchParams.set('weeks', String(params.weeks));

  return `${baseUrl}${url.search}`;
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Gets a human-readable label for a feedback type
 * @param type - Feedback type
 * @returns Human-readable label
 */
export function getFeedbackTypeLabel(type: FeedbackType): string {
  switch (type) {
    case 'thumbs-up':
      return 'Positive';
    case 'thumbs-down':
      return 'Negative';
    case 'issue-report':
      return 'Issue Report';
    default:
      return type;
  }
}

/**
 * Gets an emoji icon for a feedback type
 * @param type - Feedback type
 * @returns Emoji string
 */
export function getFeedbackTypeIcon(type: FeedbackType): string {
  switch (type) {
    case 'thumbs-up':
      return '\uD83D\uDC4D'; // thumbs up emoji
    case 'thumbs-down':
      return '\uD83D\uDC4E'; // thumbs down emoji
    case 'issue-report':
      return '\u26A0\uFE0F'; // warning sign emoji
    default:
      return '';
  }
}

/**
 * Gets a color class name for a feedback type (for use with Tailwind CSS)
 * @param type - Feedback type
 * @returns Tailwind color class name
 */
export function getFeedbackTypeColor(type: FeedbackType): string {
  switch (type) {
    case 'thumbs-up':
      return 'text-green-600';
    case 'thumbs-down':
      return 'text-red-600';
    case 'issue-report':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Gets a background color class name for a feedback type (for use with Tailwind CSS)
 * @param type - Feedback type
 * @returns Tailwind background color class name
 */
export function getFeedbackTypeBgColor(type: FeedbackType): string {
  switch (type) {
    case 'thumbs-up':
      return 'bg-green-100';
    case 'thumbs-down':
      return 'bg-red-100';
    case 'issue-report':
      return 'bg-yellow-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Truncates a comment to a maximum length with ellipsis
 * @param comment - Comment text
 * @param maxLength - Maximum length (default: 100)
 * @returns Truncated comment with ellipsis if needed
 */
export function truncateComment(comment: string, maxLength: number = 100): string {
  if (comment.length <= maxLength) {
    return comment;
  }
  return comment.slice(0, maxLength - 3) + '...';
}

/**
 * Gets unique tool names from feedback entries
 * @param entries - Array of feedback entries
 * @returns Array of unique tool names sorted alphabetically
 */
export function getUniqueToolNames(entries: FeedbackEntry[]): string[] {
  const toolNames = new Set<string>();
  for (const entry of entries) {
    toolNames.add(entry.toolName);
  }
  return Array.from(toolNames).sort();
}
