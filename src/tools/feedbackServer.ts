import { FeedbackData, FeedbackEntry, FeedbackType } from "../models/interfaces.js";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Server for handling user feedback submission, validation, and storage.
 * Supports thumbs-up/down ratings, issue reports, and optional text comments.
 */
export class FeedbackServer {
    private feedbackFilePath: string;

    constructor(feedbackDir?: string) {
        // Use provided directory or default to ~/.think-mcp/feedback
        const baseDir = feedbackDir || path.join(
            process.env.HOME || process.env.USERPROFILE || ".",
            ".think-mcp"
        );
        this.feedbackFilePath = path.join(baseDir, "feedback.json");
        this.ensureStorageDirectory(baseDir);
    }

    /**
     * Ensures the storage directory exists
     */
    private ensureStorageDirectory(dir: string): void {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (error) {
            // Directory creation may fail in some environments, continue anyway
            // Storage operations will handle errors gracefully
        }
    }

    /**
     * Validates the feedback input data
     */
    private validateFeedbackData(input: unknown): FeedbackData {
        const data = input as Record<string, unknown>;

        // Validate required field: rating
        if (!data.rating || typeof data.rating !== "string") {
            throw new Error("Invalid rating: must be a string");
        }
        const validRatings: FeedbackType[] = ["thumbs-up", "thumbs-down", "issue-report"];
        if (!validRatings.includes(data.rating as FeedbackType)) {
            throw new Error(
                `Invalid rating: must be one of ${validRatings.join(", ")}`
            );
        }

        // Validate required field: toolName
        if (!data.toolName || typeof data.toolName !== "string") {
            throw new Error("Invalid toolName: must be a string");
        }

        // Validate optional field: comment
        if (data.comment !== undefined && typeof data.comment !== "string") {
            throw new Error("Invalid comment: must be a string if provided");
        }

        // Validate optional field: invocationId
        if (data.invocationId !== undefined && typeof data.invocationId !== "string") {
            throw new Error("Invalid invocationId: must be a string if provided");
        }

        return {
            rating: data.rating as FeedbackType,
            toolName: data.toolName as string,
            comment: data.comment as string | undefined,
            invocationId: data.invocationId as string | undefined,
        };
    }

    /**
     * Creates a feedback entry with system-generated fields
     */
    private createFeedbackEntry(data: FeedbackData): FeedbackEntry {
        return {
            id: randomUUID(),
            rating: data.rating,
            toolName: data.toolName,
            timestamp: new Date().toISOString(),
            invocationId: data.invocationId || randomUUID(),
            comment: data.comment,
        };
    }

    /**
     * Loads existing feedback entries from storage
     */
    private loadFeedbackEntries(): FeedbackEntry[] {
        try {
            if (fs.existsSync(this.feedbackFilePath)) {
                const content = fs.readFileSync(this.feedbackFilePath, "utf-8");
                const parsed = JSON.parse(content);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            // If file is corrupted or unreadable, start fresh
        }
        return [];
    }

    /**
     * Saves feedback entries to storage
     */
    private saveFeedbackEntries(entries: FeedbackEntry[]): void {
        try {
            // Ensure directory exists before writing
            const dir = path.dirname(this.feedbackFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(
                this.feedbackFilePath,
                JSON.stringify(entries, null, 2),
                "utf-8"
            );
        } catch (error) {
            // Storage errors should not break feedback submission
            // Log to stderr for visibility
            console.error(
                chalk.yellow("Warning: Could not save feedback to file:"),
                error instanceof Error ? error.message : String(error)
            );
        }
    }

    /**
     * Stores a feedback entry
     */
    private storeFeedback(entry: FeedbackEntry): void {
        const entries = this.loadFeedbackEntries();
        entries.push(entry);
        this.saveFeedbackEntries(entries);
    }

    /**
     * Formats feedback output for console visibility
     */
    private formatFeedbackOutput(entry: FeedbackEntry): string {
        const { id, rating, toolName, timestamp, comment, invocationId } = entry;

        const ratingIcon = this.getRatingIcon(rating);
        const ratingColor = this.getRatingColor(rating);

        let output = `\n${chalk.bold.blue("📝 Feedback Received")}\n`;
        output += `${chalk.gray("─".repeat(40))}\n`;
        output += `${chalk.bold("Rating:")} ${ratingColor(`${ratingIcon} ${rating}`)}\n`;
        output += `${chalk.bold("Tool:")} ${chalk.cyan(toolName)}\n`;
        output += `${chalk.bold("Time:")} ${chalk.gray(timestamp)}\n`;
        output += `${chalk.bold("ID:")} ${chalk.gray(id)}\n`;

        if (invocationId) {
            output += `${chalk.bold("Invocation:")} ${chalk.gray(invocationId)}\n`;
        }

        if (comment) {
            output += `${chalk.bold("Comment:")}\n`;
            output += `${chalk.italic(comment)}\n`;
        }

        output += `${chalk.gray("─".repeat(40))}\n`;
        output += chalk.green("✓ Feedback stored successfully\n");

        return output;
    }

    /**
     * Gets the appropriate icon for the rating type
     */
    private getRatingIcon(rating: FeedbackType): string {
        switch (rating) {
            case "thumbs-up":
                return "👍";
            case "thumbs-down":
                return "👎";
            case "issue-report":
                return "⚠️";
            default:
                return "📋";
        }
    }

    /**
     * Gets the appropriate chalk color function for the rating type
     */
    private getRatingColor(rating: FeedbackType): (text: string) => string {
        switch (rating) {
            case "thumbs-up":
                return chalk.green;
            case "thumbs-down":
                return chalk.red;
            case "issue-report":
                return chalk.yellow;
            default:
                return chalk.white;
        }
    }

    /**
     * Processes feedback submission
     * Main entry point for the feedback tool
     */
    public processFeedback(input: unknown): {
        id: string;
        rating: FeedbackType;
        toolName: string;
        timestamp: string;
        invocationId: string;
        status: "success" | "failed";
        message: string;
        hasComment: boolean;
        error?: string;
    } {
        try {
            // Validate input
            const validatedData = this.validateFeedbackData(input);

            // Create feedback entry with system fields
            const entry = this.createFeedbackEntry(validatedData);

            // Store feedback
            this.storeFeedback(entry);

            // Format and display output
            const formattedOutput = this.formatFeedbackOutput(entry);
            console.error(formattedOutput);

            // Return success response
            return {
                id: entry.id,
                rating: entry.rating,
                toolName: entry.toolName,
                timestamp: entry.timestamp,
                invocationId: entry.invocationId,
                status: "success",
                message: "Thank you for your feedback!",
                hasComment: !!entry.comment,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(chalk.red(`\n❌ Feedback Error: ${errorMessage}\n`));

            return {
                id: "",
                rating: "thumbs-down",
                toolName: "",
                timestamp: new Date().toISOString(),
                invocationId: "",
                status: "failed",
                message: "Failed to process feedback",
                hasComment: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Retrieves all stored feedback entries
     * Useful for dashboard and reporting
     */
    public getAllFeedback(): FeedbackEntry[] {
        return this.loadFeedbackEntries();
    }

    /**
     * Retrieves feedback entries for a specific tool
     */
    public getFeedbackByTool(toolName: string): FeedbackEntry[] {
        const entries = this.loadFeedbackEntries();
        return entries.filter((entry) => entry.toolName === toolName);
    }

    /**
     * Retrieves feedback summary statistics
     */
    public getFeedbackSummary(): {
        total: number;
        byRating: Record<FeedbackType, number>;
        byTool: Record<string, number>;
    } {
        const entries = this.loadFeedbackEntries();

        const byRating: Record<FeedbackType, number> = {
            "thumbs-up": 0,
            "thumbs-down": 0,
            "issue-report": 0,
        };

        const byTool: Record<string, number> = {};

        for (const entry of entries) {
            byRating[entry.rating]++;
            byTool[entry.toolName] = (byTool[entry.toolName] || 0) + 1;
        }

        return {
            total: entries.length,
            byRating,
            byTool,
        };
    }

    /**
     * Gets the feedback storage file path (for testing/debugging)
     */
    public getStoragePath(): string {
        return this.feedbackFilePath;
    }
}
