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
 * API response for feedback list endpoint
 */
interface FeedbackListResponse {
  data: FeedbackEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  filters: {
    tool?: string;
    rating?: FeedbackType;
    startDate?: string;
    endDate?: string;
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
 * Validates a rating type string
 */
function isValidRating(rating: string): rating is FeedbackType {
  return ['thumbs-up', 'thumbs-down', 'issue-report'].includes(rating);
}

/**
 * Validates an ISO date string
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * GET endpoint to retrieve feedback entries with filtering and pagination
 *
 * Query parameters:
 * - tool: Filter by tool name (string)
 * - rating: Filter by rating type (thumbs-up, thumbs-down, issue-report)
 * - startDate: Filter entries from this date (ISO 8601)
 * - endDate: Filter entries until this date (ISO 8601)
 * - page: Page number for pagination (default: 1)
 * - limit: Number of entries per page (default: 20, max: 100)
 * - sort: Sort order (asc or desc by timestamp, default: desc)
 */
export async function GET(request: NextRequest): Promise<NextResponse<FeedbackListResponse | { error: string; details?: string }>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const tool = searchParams.get('tool') || undefined;
    const ratingParam = searchParams.get('rating');
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const sortParam = searchParams.get('sort') || 'desc';

    // Validate rating if provided
    let rating: FeedbackType | undefined;
    if (ratingParam) {
      if (!isValidRating(ratingParam)) {
        return NextResponse.json(
          { error: 'Invalid rating parameter', details: 'Must be one of: thumbs-up, thumbs-down, issue-report' },
          { status: 400 }
        );
      }
      rating = ratingParam;
    }

    // Validate date parameters
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { error: 'Invalid startDate parameter', details: 'Must be a valid ISO 8601 date string' },
        { status: 400 }
      );
    }
    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { error: 'Invalid endDate parameter', details: 'Must be a valid ISO 8601 date string' },
        { status: 400 }
      );
    }

    // Parse and validate pagination parameters
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10) || 20));

    // Validate sort parameter
    if (sortParam !== 'asc' && sortParam !== 'desc') {
      return NextResponse.json(
        { error: 'Invalid sort parameter', details: 'Must be "asc" or "desc"' },
        { status: 400 }
      );
    }

    // Load all feedback entries
    let entries = loadFeedbackEntries();

    // Apply filters
    if (tool) {
      entries = entries.filter(entry => entry.toolName === tool);
    }

    if (rating) {
      entries = entries.filter(entry => entry.rating === rating);
    }

    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      entries = entries.filter(entry => new Date(entry.timestamp).getTime() >= startDateTime);
    }

    if (endDate) {
      const endDateTime = new Date(endDate).getTime();
      entries = entries.filter(entry => new Date(entry.timestamp).getTime() <= endDateTime);
    }

    // Sort entries by timestamp
    entries.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortParam === 'asc' ? timeA - timeB : timeB - timeA;
    });

    // Calculate pagination
    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = entries.slice(startIndex, endIndex);

    // Build response
    const response: FeedbackListResponse = {
      data: paginatedEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        ...(tool && { tool }),
        ...(rating && { rating }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback entries', details: errorMessage },
      { status: 500 }
    );
  }
}
