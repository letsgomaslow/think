# Standardize Response Format Across All Servers

## Overview
Standardize the response format across all tool servers to use a consistent MCP content format. Currently modelServer returns simple objects while debugServer, patternServer return MCP content format with { content: [{ type: 'text', text }] }. TraceServer returns the validated input directly.


## Rationale

The code reveals inconsistency - debugServer and patternServer already use the MCP content format pattern with proper typing ({ content: Array<{ type: string; text: string }>; isError?: boolean }), but modelServer uses a different simple object format. This creates inconsistent handling in the main index.ts where formatResponse() wraps everything anyway.

---
*This spec was created from ideation and is pending detailed specification.*
