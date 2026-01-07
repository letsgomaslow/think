# CORS Configuration Documentation

## Current Configuration

The `vercel.json` file configures CORS (Cross-Origin Resource Sharing) headers for all API endpoints under `/api/*`:

```json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Mcp-Session-Id, Mcp-Protocol-Version"
}
```

## Why Credentials Are NOT Included

**IMPORTANT:** This configuration intentionally does **NOT** include `Access-Control-Allow-Credentials: true`.

### Security Rationale

The combination of:
- `Access-Control-Allow-Origin: *` (wildcard origin)
- `Access-Control-Allow-Credentials: true`

is a **dangerous security vulnerability** that was fixed in this project. This combination would allow any website to make authenticated requests to our API on behalf of users, enabling CSRF-like attacks.

### API Design

Our APIs are designed to be **stateless and public**:

1. **MCP Transport API** (`/api/[transport]`)
   - Explicitly stateless (no session management)
   - No authentication required
   - Uses WebStandardStreamableHTTPServerTransport
   - Public access by design

2. **Waitlist API** (`/api/waitlist`)
   - Simple REST endpoint
   - No cookies or session-based authentication
   - Server-side API keys only (not browser credentials)
   - Public access for registration

Since neither API uses browser credentials (cookies, HTTP authentication, or client-side certificates), the `Access-Control-Allow-Credentials` header is unnecessary and was removed for security.

## For Future Maintainers

### If You Need to Add Authentication

If you plan to add authentication that uses browser credentials:

1. **DO NOT** add `Access-Control-Allow-Credentials: true` with wildcard origin (`*`)
2. **INSTEAD**, replace the wildcard with specific allowed origins:

```json
{
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Credentials": "true"
}
```

3. For multiple origins, implement dynamic origin validation in your API routes rather than using the static vercel.json configuration.

### If APIs Remain Stateless

If your APIs remain stateless and public (recommended):

- ✅ Keep `Access-Control-Allow-Origin: *`
- ✅ Do NOT add `Access-Control-Allow-Credentials`
- ✅ Continue using server-side API keys for third-party services
- ✅ Use API keys passed in request headers (not cookies)

## References

- [CORS and Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)
- [Security Fix Documentation](./.auto-claude/specs/020-fix-overly-permissive-cors-configuration/api-verification.md)
- Browsers explicitly forbid credentials with wildcard origins for security

## Change History

- **2026-01-07**: Removed `Access-Control-Allow-Credentials: true` to fix security vulnerability (Issue #020)
- **2026-01-07**: Created this documentation to prevent future regressions
