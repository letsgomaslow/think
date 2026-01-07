/**
 * Privacy Notice Constants
 *
 * Inline privacy notices for displaying to users during first-run consent
 * and other privacy-related interactions.
 *
 * These notices are designed to be:
 * - Clear and understandable
 * - Concise but complete
 * - Suitable for terminal display
 */

// =============================================================================
// Version
// =============================================================================

/**
 * Version of the privacy notice.
 * Should match CURRENT_POLICY_VERSION in consent.ts.
 */
export const PRIVACY_NOTICE_VERSION = '1.0.0';

// =============================================================================
// Inline Notices
// =============================================================================

/**
 * Short one-line summary for status displays.
 */
export const PRIVACY_SUMMARY = 'Analytics track tool usage only (not content). Your data stays local.';

/**
 * Brief privacy notice for first-run prompt.
 * Suitable for terminal display with limited space.
 */
export const PRIVACY_NOTICE_BRIEF = `
think-mcp can collect anonymous usage analytics to help improve the tool.

What we collect:
  - Which tools you use (e.g., trace, model, pattern)
  - Success/error status (not error messages)
  - Response times

What we DON'T collect:
  - Your input content or arguments
  - Personal information
  - Error message text

All data is stored locally on your machine and never transmitted externally.
Default retention: 90 days.

You can opt out at any time with: think-mcp analytics disable
`.trim();

/**
 * Full privacy notice with all details.
 * Suitable for help pages or --help output.
 */
export const PRIVACY_NOTICE_FULL = `
================================================================================
                           THINK-MCP PRIVACY NOTICE
================================================================================

think-mcp includes optional, opt-in analytics to help maintainers understand
tool usage patterns and improve the tool.

DATA COLLECTED (metadata only):
  - Tool name (trace, model, pattern, paradigm, debug, council, etc.)
  - Timestamp of invocation
  - Success/error status (boolean)
  - Duration in milliseconds
  - Error category (validation/runtime/timeout) - NOT error messages
  - Random session ID (not tied to your identity)

DATA NOT COLLECTED:
  - Tool arguments or input content (your actual data)
  - Error messages or stack traces
  - Personal information (username, IP, machine ID)
  - File paths or file contents
  - Any other system information

DATA STORAGE:
  - Location: ~/.think-mcp/analytics/
  - Format: Daily JSON files
  - Retention: 90 days (configurable)
  - All data stays local - nothing is transmitted externally

YOUR CONTROLS:
  - Enable:  think-mcp analytics enable
  - Disable: think-mcp analytics disable
  - Status:  think-mcp analytics status
  - Export:  think-mcp analytics export
  - Delete:  think-mcp analytics clear

For full privacy policy, see: docs/PRIVACY.md

================================================================================
`.trim();

/**
 * Consent prompt message for first-run.
 */
export const CONSENT_PROMPT = `
Would you like to help improve think-mcp by enabling anonymous usage analytics?

${PRIVACY_NOTICE_BRIEF}

Enable analytics?
`.trim();

/**
 * Message shown when analytics are enabled.
 */
export const ANALYTICS_ENABLED_MESSAGE = `
Analytics enabled. Thank you for helping improve think-mcp!

Your data is stored locally at: ~/.think-mcp/analytics/
You can disable at any time with: think-mcp analytics disable
`.trim();

/**
 * Message shown when analytics are disabled.
 */
export const ANALYTICS_DISABLED_MESSAGE = `
Analytics disabled. No usage data will be collected.

To enable in the future: think-mcp analytics enable
`.trim();

/**
 * Message shown when analytics are disabled and data is deleted.
 */
export const ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE = `
Analytics disabled and all collected data has been deleted.

To enable in the future: think-mcp analytics enable
`.trim();

/**
 * Message shown when re-consent is needed due to policy changes.
 */
export const RECONSENT_PROMPT = `
The privacy policy has been updated since you last consented to analytics.

Please review the changes and confirm if you'd like to continue with analytics:

${PRIVACY_NOTICE_BRIEF}

Continue with analytics enabled?
`.trim();

// =============================================================================
// CLI Output Helpers
// =============================================================================

/**
 * Data collection summary table for CLI display.
 */
export const DATA_COLLECTION_TABLE = `
+------------------+-------------------------------------------+
| Data Collected   | Description                               |
+------------------+-------------------------------------------+
| Tool Name        | Which tool was used (e.g., 'trace')       |
| Timestamp        | When the tool was invoked                 |
| Success/Error    | Whether it succeeded (true/false)         |
| Duration         | How long it took (milliseconds)           |
| Error Category   | Type of error if failed (not message)     |
| Session ID       | Random ID (not tied to you)               |
+------------------+-------------------------------------------+
| NOT Collected    | Input content, error messages, PII        |
+------------------+-------------------------------------------+
`.trim();

/**
 * Quick reference for CLI help.
 */
export const CLI_QUICK_REFERENCE = `
Analytics Commands:
  think-mcp analytics enable   - Opt in to analytics
  think-mcp analytics disable  - Opt out (add --delete-data to remove data)
  think-mcp analytics status   - View current settings
  think-mcp analytics export   - Export collected data
  think-mcp analytics clear    - Delete all collected data
`.trim();

// =============================================================================
// Exported Object for Easy Import
// =============================================================================

/**
 * All privacy notices bundled for convenient import.
 *
 * @example
 * import { PrivacyNotice } from './PRIVACY_NOTICE.js';
 * console.log(PrivacyNotice.brief);
 */
export const PrivacyNotice = {
  /** Version of the privacy notice */
  version: PRIVACY_NOTICE_VERSION,

  /** One-line summary */
  summary: PRIVACY_SUMMARY,

  /** Brief notice for consent prompts */
  brief: PRIVACY_NOTICE_BRIEF,

  /** Full detailed notice */
  full: PRIVACY_NOTICE_FULL,

  /** First-run consent prompt */
  consentPrompt: CONSENT_PROMPT,

  /** Re-consent prompt for policy updates */
  reconsentPrompt: RECONSENT_PROMPT,

  /** Message when analytics enabled */
  enabledMessage: ANALYTICS_ENABLED_MESSAGE,

  /** Message when analytics disabled */
  disabledMessage: ANALYTICS_DISABLED_MESSAGE,

  /** Message when disabled with data deletion */
  disabledWithDataDeletedMessage: ANALYTICS_DISABLED_WITH_DATA_DELETED_MESSAGE,

  /** Data collection summary table */
  dataTable: DATA_COLLECTION_TABLE,

  /** CLI quick reference */
  cliQuickReference: CLI_QUICK_REFERENCE,
} as const;

// Default export for convenience
export default PrivacyNotice;
