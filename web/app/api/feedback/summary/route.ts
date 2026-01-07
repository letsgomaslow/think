import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Type definitions for feedback entries
 * Matches FeedbackEntry from src/models/interfaces.ts
 */
type FeedbackType = 'thumbs-up' | 'thumbs-down' | 'issue-report';

interface FeedbackEntry {
  id: string;
  rating: FeedbackType;
  comment?: string;
  toolName: string;
  timestamp: string;
  invocationId: string;
  toolContext?: {
    input?: Record<string, unknown>;
    outputSummary?: string;
  };
}

/**
 * Rating counts for feedback statistics
 */
interface RatingCounts {
  'thumbs-up': number;
  'thumbs-down': number;
  'issue-report': number;
}

/**
 * Per-tool breakdown with rating counts
 */
interface ToolBreakdown {
  toolName: string;
  total: number;
  ratings: RatingCounts;
}

/**
 * Trend data point for a specific time period
 */
interface TrendDataPoint {
  date: string;
  total: number;
  ratings: RatingCounts;
}

/**
 * API response for feedback summary endpoint
 */
interface FeedbackSummaryResponse {
  totalFeedback: number;
  ratingCounts: RatingCounts;
  ratingPercentages: {
    'thumbs-up': number;
    'thumbs-down': number;
    'issue-report': number;
  };
  toolBreakdown: ToolBreakdown[];
  trends: {
    daily: TrendDataPoint[];
    weekly: TrendDataPoint[];
  };
  timeRange: {
    earliest: string | null;
    latest: string | null;
  };
}

/**
 * Gets the feedback storage file path
 * Uses the same location as FeedbackServer for consistency
 */
function getFeedbackFilePath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  return path.join(homeDir, '.think-mcp', 'feedback.json');
}

/**
 * Loads feedback entries from the storage file
 * Returns empty array if file doesn't exist or is corrupted
 */
function loadFeedbackEntries(): FeedbackEntry[] {
  try {
    const filePath = getFeedbackFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    // If file is corrupted or unreadable, return empty array
    // This matches FeedbackServer behavior
  }
  return [];
}

/**
 * Creates an empty rating counts object
 */
function createEmptyRatingCounts(): RatingCounts {
  return {
    'thumbs-up': 0,
    'thumbs-down': 0,
    'issue-report': 0,
  };
}

/**
 * Formats a date to YYYY-MM-DD
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Gets the Monday of the week for a given date (for weekly aggregation)
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return formatDateKey(d);
}

/**
 * Calculates daily trend data for the last N days
 */
function calculateDailyTrends(entries: FeedbackEntry[], days: number = 30): TrendDataPoint[] {
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
    const entryDate = new Date(entry.timestamp);
    const dateKey = formatDateKey(entryDate);

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
 * Calculates weekly trend data for the last N weeks
 */
function calculateWeeklyTrends(entries: FeedbackEntry[], weeks: number = 12): TrendDataPoint[] {
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
    const entryDate = new Date(entry.timestamp);
    const weekKey = getWeekStart(entryDate);

    if (weeklyData.has(weekKey)) {
      const dataPoint = weeklyData.get(weekKey)!;
      dataPoint.total++;
      dataPoint.ratings[entry.rating]++;
    }
  }

  // Convert to sorted array
  return Array.from(weeklyData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculates per-tool breakdown statistics
 */
function calculateToolBreakdown(entries: FeedbackEntry[]): ToolBreakdown[] {
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
 * GET endpoint to retrieve aggregated feedback statistics
 *
 * Query parameters:
 * - days: Number of days for daily trend data (default: 30, max: 90)
 * - weeks: Number of weeks for weekly trend data (default: 12, max: 52)
 */
export async function GET(request: NextRequest): Promise<NextResponse<FeedbackSummaryResponse | { error: string; details?: string }>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse optional query parameters
    const daysParam = searchParams.get('days');
    const weeksParam = searchParams.get('weeks');

    // Validate and set days (default 30, max 90)
    const days = Math.min(90, Math.max(1, parseInt(daysParam || '30', 10) || 30));

    // Validate and set weeks (default 12, max 52)
    const weeks = Math.min(52, Math.max(1, parseInt(weeksParam || '12', 10) || 12));

    // Load all feedback entries
    const entries = loadFeedbackEntries();

    // Calculate total counts
    const totalFeedback = entries.length;
    const ratingCounts = createEmptyRatingCounts();

    for (const entry of entries) {
      ratingCounts[entry.rating]++;
    }

    // Calculate percentages (avoid division by zero)
    const ratingPercentages = {
      'thumbs-up': totalFeedback > 0 ? Math.round((ratingCounts['thumbs-up'] / totalFeedback) * 100) : 0,
      'thumbs-down': totalFeedback > 0 ? Math.round((ratingCounts['thumbs-down'] / totalFeedback) * 100) : 0,
      'issue-report': totalFeedback > 0 ? Math.round((ratingCounts['issue-report'] / totalFeedback) * 100) : 0,
    };

    // Calculate tool breakdown
    const toolBreakdown = calculateToolBreakdown(entries);

    // Calculate trends
    const dailyTrends = calculateDailyTrends(entries, days);
    const weeklyTrends = calculateWeeklyTrends(entries, weeks);

    // Calculate time range
    let earliest: string | null = null;
    let latest: string | null = null;

    if (entries.length > 0) {
      const sortedByTime = [...entries].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      earliest = sortedByTime[0].timestamp;
      latest = sortedByTime[sortedByTime.length - 1].timestamp;
    }

    // Build response
    const response: FeedbackSummaryResponse = {
      totalFeedback,
      ratingCounts,
      ratingPercentages,
      toolBreakdown,
      trends: {
        daily: dailyTrends,
        weekly: weeklyTrends,
      },
      timeRange: {
        earliest,
        latest,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback summary', details: errorMessage },
      { status: 500 }
    );
  }
}
