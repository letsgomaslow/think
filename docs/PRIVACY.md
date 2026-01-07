# Privacy Policy for think-mcp Analytics

**Version:** 1.0.0
**Last Updated:** January 2026

## Overview

think-mcp includes an **optional, opt-in analytics feature** designed to help maintainers understand tool usage patterns and improve the tool. This document explains exactly what data is collected, how it's used, and how to control your privacy.

**Key Principle:** Analytics are **disabled by default** and require your explicit consent before any data is collected.

---

## What Data is Collected

When you opt in to analytics, the following **metadata only** is collected for each tool invocation:

| Data Point | Description | Example |
|------------|-------------|---------|
| **Tool Name** | Which tool was invoked | `trace`, `model`, `pattern`, `paradigm`, `debug`, `council`, `decide`, `reflect`, `hypothesis`, `debate`, `map` |
| **Timestamp** | When the invocation occurred | `2024-01-15T10:30:00.000Z` |
| **Success Status** | Whether the tool completed successfully | `true` or `false` |
| **Duration** | How long the tool took to execute | `150` (milliseconds) |
| **Error Category** | If failed, the type of error (not the message) | `validation`, `runtime`, `timeout`, or `unknown` |
| **Session ID** | Random identifier for grouping invocations | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |

### What is NOT Collected

We explicitly **do not collect**:

- **Tool arguments or input content** - Your actual queries, thoughts, or data are never captured
- **Error messages** - Only the error category (e.g., "validation"), never the specific error text
- **Personally Identifiable Information (PII)** - No usernames, IP addresses, machine identifiers, or account information
- **File paths or file contents** - Nothing about your filesystem or files
- **Environment variables** - No system or configuration data
- **Usage patterns of other applications** - Only think-mcp tool invocations

### Session ID Explained

The session ID is:
- Randomly generated each time the MCP server starts
- Not tied to any user account or machine identifier
- Used only to group tool invocations within a single session for trend analysis
- Never correlated with personal information

---

## How Data is Used

Collected analytics data is used to:

1. **Understand Tool Popularity** - Identify which tools provide the most value
2. **Improve Reliability** - Detect tools with high error rates that need attention
3. **Optimize Performance** - Find tools that are slow and could be optimized
4. **Guide Development** - Prioritize features based on actual usage patterns
5. **Identify Trends** - Track usage growth or decline over time

### Data Processing

- All data is stored **locally** on your machine in `~/.think-mcp/analytics/`
- Data is processed locally to generate insights
- **No data is transmitted to external servers**
- You have full access to all collected data at any time

---

## Data Retention

- **Default retention period:** 90 days
- Data older than the retention period is automatically deleted
- You can configure a different retention period (1-365 days) in settings
- You can delete all data at any time

### Storage Location

Analytics data is stored in:
```
~/.think-mcp/analytics/
├── analytics-2024-01-15.json  # Daily event files
├── analytics-2024-01-14.json
└── ...
```

Each daily file contains raw events in JSON format. You can inspect these files at any time.

---

## Your Rights and Controls

### Enable Analytics (Opt-In)

You must explicitly opt in before any data is collected:

```bash
# Via CLI (recommended)
think-mcp analytics enable

# Via environment variable
export THINK_MCP_ANALYTICS_ENABLED=true

# Via config file (~/.think-mcp/analytics.json)
{
  "enabled": true
}
```

### Disable Analytics (Opt-Out)

You can opt out at any time:

```bash
# Via CLI
think-mcp analytics disable

# Optionally delete all collected data
think-mcp analytics disable --delete-data

# Via environment variable
export THINK_MCP_ANALYTICS_ENABLED=false

# Via config file (~/.think-mcp/analytics.json)
{
  "enabled": false
}
```

### View Your Data

You can view all collected analytics data:

```bash
# View current analytics status
think-mcp analytics status

# Export all data to a file
think-mcp analytics export --output my-data.json

# View data directly
cat ~/.think-mcp/analytics/analytics-*.json
```

### Delete Your Data

You can delete all collected data at any time:

```bash
# Delete all analytics data
think-mcp analytics clear

# Or manually remove the directory
rm -rf ~/.think-mcp/analytics/
```

### Configure Retention Period

Adjust how long data is kept:

```bash
# Set retention to 30 days
export THINK_MCP_ANALYTICS_RETENTION_DAYS=30

# Or via config file
{
  "enabled": true,
  "retentionDays": 30
}
```

---

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `THINK_MCP_ANALYTICS_ENABLED` | Enable/disable analytics | `false` |
| `THINK_MCP_ANALYTICS_RETENTION_DAYS` | Days to retain data | `90` |
| `THINK_MCP_ANALYTICS_STORAGE_PATH` | Custom storage directory | `~/.think-mcp/analytics` |
| `THINK_MCP_ANALYTICS_BATCH_SIZE` | Events to batch before write | `50` |
| `THINK_MCP_ANALYTICS_FLUSH_INTERVAL_MS` | Max time before flush | `30000` |

### Config File

Location: `~/.think-mcp/analytics.json`

```json
{
  "enabled": false,
  "retentionDays": 90,
  "storagePath": "~/.think-mcp/analytics",
  "batchSize": 50,
  "flushIntervalMs": 30000
}
```

### Consent Record

Location: `~/.think-mcp/consent.json`

This file tracks your consent status:

```json
{
  "hasConsented": true,
  "consentedAt": "2024-01-15T10:30:00.000Z",
  "policyVersion": "1.0.0"
}
```

---

## Privacy by Design

think-mcp analytics was designed with privacy as a core principle:

1. **Opt-In Only** - No data is collected until you explicitly enable it
2. **Minimal Data** - Only metadata necessary for insights; no content
3. **Local Storage** - All data stays on your machine
4. **Transparent** - All collected data is accessible and readable
5. **User Control** - Easy to enable, disable, view, and delete data
6. **No Tracking** - Session IDs are random; no cross-session correlation
7. **No Network** - Data is never transmitted externally

---

## Changes to This Policy

If we make significant changes to this privacy policy:

1. The policy version number will be incremented
2. Users will be prompted to re-consent if already opted in
3. Changes will be documented in the changelog

---

## Contact

For questions about privacy or this policy:

- Open an issue on the GitHub repository
- Review the source code in `src/analytics/`

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Default State** | Disabled (opt-in required) |
| **Data Collected** | Tool names, timestamps, success/error status, duration |
| **Data NOT Collected** | Content, arguments, PII, error messages |
| **Storage Location** | Local only (`~/.think-mcp/analytics/`) |
| **Retention Period** | 90 days (configurable) |
| **Opt-Out Method** | CLI command, env var, or config file |
| **Data Deletion** | Available via CLI or manual file deletion |
