# Deployment Configuration - Security Headers

## Overview

This document outlines the security headers implementation and deployment configuration for the think-mcp web application. The implementation uses a multi-layered approach to ensure comprehensive security header coverage across all routes.

## Architecture

### Three-Layer Security Header Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Response                         │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Vercel Config (vercel.json)                   │
│  - CORS headers for API routes                          │
│  - Specific to /api/* routes                            │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Next.js Config (next.config.js)               │
│  - Fallback security headers                            │
│  - Static CSP (without nonce)                           │
│  - Applies to all routes                                │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Middleware (middleware.ts) [HIGHEST PRIORITY] │
│  - Dynamic CSP with unique nonce per request            │
│  - All security headers                                 │
│  - Applies to dynamic routes                            │
│  - Runs on Vercel Edge Runtime                          │
└─────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Middleware Configuration

**File:** `web/middleware.ts`

**Purpose:**
- Generate unique CSP nonce per request
- Inject nonce into Content-Security-Policy header
- Apply all security headers to dynamic routes
- Store nonce for server component access

**Runtime:** Vercel Edge Runtime (automatically detected)

**Route Matching:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Applies to:**
- All pages and routes
- API routes (in addition to vercel.json headers)

**Excludes:**
- Static assets (`/_next/static/*`)
- Next.js optimized images (`/_next/image/*`)
- Favicon
- Image files (svg, png, jpg, jpeg, gif, webp)

**Key Functions:**
```typescript
// Generate unique nonce per request
const nonce = generateNonce();

// Build security headers with nonce
const headers = buildSecurityHeaders(nonce);

// Store nonce for server components
response.headers.set('x-nonce', nonce);
```

### 2. Next.js Configuration

**File:** `web/next.config.js`

**Purpose:**
- Provide fallback security headers for routes where middleware doesn't apply
- Static CSP without nonce for static assets
- Ensure security headers on all routes

**Headers Applied:**
```javascript
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy': '[Static CSP without nonce]'
}
```

**Route Matching:**
```javascript
{
  source: '/:path*',
  headers: [/* security headers */]
}
```

### 3. Vercel Configuration

**File:** `web/vercel.json`

**Purpose:**
- Configure CORS headers for API routes
- Vercel-specific deployment settings

**Headers Applied:**
```json
{
  "source": "/api/(.*)",
  "headers": [
    { "key": "Access-Control-Allow-Credentials", "value": "true" },
    { "key": "Access-Control-Allow-Origin", "value": "*" },
    { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
    { "key": "Access-Control-Allow-Headers", "value": "X-Requested-With, Content-Type, Authorization" }
  ]
}
```

**Compatibility:**
- CORS headers are complementary to security headers
- API routes receive both CORS and security headers
- No conflicts between vercel.json and middleware/next.config.js

## Security Headers Reference

### Content-Security-Policy (CSP)

**Dynamic Routes (from middleware):**
```
script-src 'self' 'nonce-{UNIQUE_PER_REQUEST}' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
```

**Static Routes (from next.config.js):**
```
script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;
[... same directives without nonce ...]
```

**Key Features:**
- ✅ Unique nonce per request prevents script injection
- ✅ Google Analytics domains whitelisted
- ✅ Google Fonts allowed (googleapis.com, gstatic.com)
- ✅ Data URIs allowed for images
- ✅ Frame ancestors blocked (clickjacking protection)
- ✅ Inline styles allowed (required for Tailwind/styling)

### X-Frame-Options

```
X-Frame-Options: DENY
```

**Purpose:** Prevent clickjacking attacks by disallowing iframe embedding

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**Purpose:** Prevent MIME-type sniffing attacks

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose:** Control referrer information sent with requests
- Same-origin: Full URL
- Cross-origin HTTPS: Origin only
- Cross-origin HTTP: No referrer

### Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Purpose:** Disable browser features not used by the application

### Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Purpose:** Force HTTPS connections
- max-age: 2 years (63072000 seconds)
- includeSubDomains: Apply to all subdomains
- preload: Eligible for browser HSTS preload list

## Nonce Implementation

### Nonce Generation

**File:** `web/lib/security/csp.ts`

```typescript
import crypto from 'crypto';

export function generateNonce(): CSPNonce {
  return crypto.randomBytes(16).toString('base64');
}
```

**Characteristics:**
- Cryptographically secure random generation
- 16 bytes = 128 bits of entropy
- Base64 encoded for CSP header
- Unique per request

### Nonce Flow

```
1. Request arrives
   ↓
2. Middleware executes
   ↓
3. generateNonce() creates unique value
   ↓
4. Nonce injected into CSP header
   ↓
5. Nonce stored in x-nonce response header
   ↓
6. Server component retrieves nonce via getNonce()
   ↓
7. Nonce passed to GoogleAnalytics component
   ↓
8. Script tags rendered with nonce attribute
   ↓
9. Browser validates inline scripts against nonce
```

### Nonce Access in Server Components

**File:** `web/lib/security/get-nonce.ts`

```typescript
import { headers } from 'next/headers';

export function getNonce(): CSPNonce | undefined {
  try {
    return headers().get('x-nonce') ?? undefined;
  } catch {
    return undefined;
  }
}
```

**Usage in layout.tsx:**
```typescript
const nonce = getNonce();
return <GoogleAnalytics nonce={nonce} />;
```

## Google Analytics Integration

### Component Update

**File:** `web/components/analytics/google-analytics.tsx`

**Changes:**
1. Accept nonce prop
2. Pass nonce to Script components
3. Maintain backward compatibility (nonce optional)

```typescript
interface GoogleAnalyticsProps {
  nonce?: CSPNonce;
}

export function GoogleAnalytics({ nonce }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
        {/* inline GA initialization */}
      </Script>
    </>
  );
}
```

**CSP Compliance:**
- External GA script: Allowed by `script-src https://www.googletagmanager.com`
- Inline GA script: Protected by nonce attribute
- GA tracking calls: Allowed by `connect-src https://www.google-analytics.com`

## Deployment Environments

### Development Environment

**Command:** `npm run dev`

**Characteristics:**
- Middleware executes and generates nonces
- Security headers applied
- Some CSP violations acceptable (HMR, dev tools)
- Hot Module Replacement may bypass some security features

**Verification:**
```bash
npm run dev
# In another terminal:
node scripts/verify-security-headers.mjs http://localhost:3000
```

### Production Build

**Command:** `npm run build && npm start`

**Characteristics:**
- Optimized production bundle
- Middleware compiled to Edge Runtime compatible code
- All security headers active
- No CSP violations should occur

**Verification:**
```bash
npm run build
npm start
# In another terminal:
node scripts/verify-security-headers.mjs http://localhost:3000
```

### Vercel Deployment

**Trigger:** Git push to connected repository

**Process:**
1. Vercel detects push
2. Runs `npm run build`
3. Deploys static assets to CDN
4. Deploys middleware to Edge Runtime
5. Configures routes according to vercel.json

**Edge Runtime:**
- Middleware runs on Vercel Edge Network
- Low latency header injection
- Globally distributed
- Compatible with Web APIs only (no Node.js fs, etc.)

**Verification:**
```bash
# After deployment
node scripts/verify-security-headers.mjs https://your-app.vercel.app
```

## Testing & Verification

### Automated Verification

**Script:** `web/scripts/verify-security-headers.mjs`

**Usage:**
```bash
node scripts/verify-security-headers.mjs [URL]
# Default URL: http://localhost:3000
```

**Checks:**
- ✅ Content-Security-Policy header presence
- ✅ CSP nonce directive
- ✅ Google Analytics domains in CSP
- ✅ X-Frame-Options header
- ✅ X-Content-Type-Options header
- ✅ Referrer-Policy header
- ✅ Permissions-Policy header
- ✅ Strict-Transport-Security header

### Manual Verification

**Browser DevTools:**
1. Open Network tab
2. Reload page
3. Click document request
4. Verify Response Headers

**Console Checks:**
- No CSP violation errors
- Google Analytics loads successfully
- No blocked resources

**Full guide:** See `manual-testing-guide.md`

## Maintenance & Updates

### Adding New CSP Domains

**File to modify:** `web/lib/security/headers.ts`

```typescript
const cspDirectives = {
  'script-src': [
    "'self'",
    "'nonce-{NONCE}'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    // Add new trusted domain here
    "https://new-trusted-domain.com",
  ],
  // ... other directives
};
```

**After modification:**
1. Rebuild application
2. Test with verification script
3. Check browser console for violations

### Updating Security Headers

**Files to modify:**
- `web/lib/security/headers.ts` - Main configuration
- `web/next.config.js` - Fallback headers (sync with headers.ts)

**Process:**
1. Update header configuration
2. Test in development
3. Run verification script
4. Deploy to production
5. Monitor for issues

### Adding New Third-Party Scripts

**Steps:**
1. Add domain to CSP in `web/lib/security/headers.ts`
2. If inline script required:
   - Accept nonce prop in component
   - Add nonce attribute to Script tag
3. Test CSP compliance
4. Verify no violations in console

## Troubleshooting

### CSP Violations

**Symptom:** Console errors about blocked resources

**Solutions:**
1. Check CSP directives include required domains
2. Verify nonce attribute on inline scripts
3. Ensure middleware is executing (check nonce in headers)

### Middleware Not Executing

**Symptom:** No x-nonce header, CSP without nonce

**Solutions:**
1. Check middleware.ts matcher configuration
2. Verify file is at `web/middleware.ts` (not in subdirectory)
3. Check build output for middleware compilation
4. Ensure Edge Runtime compatibility (no Node.js APIs)

### Google Analytics Not Loading

**Symptom:** GA scripts blocked, no tracking data

**Solutions:**
1. Verify GA domains in CSP
2. Check nonce on inline GA script
3. Ensure nonce prop passed from layout to GoogleAnalytics component
4. Check Network tab for blocked requests

## Security Considerations

### Defense in Depth

Multiple security layers:
1. CSP prevents script injection
2. X-Frame-Options prevents clickjacking
3. X-Content-Type-Options prevents MIME sniffing
4. HSTS enforces HTTPS
5. Permissions-Policy limits browser features

### Nonce Security

- ✅ Unique per request (prevents replay attacks)
- ✅ Cryptographically secure generation
- ✅ Base64 encoded (CSP spec requirement)
- ✅ Server-side only (not predictable by client)

### CSP Best Practices

- ❌ Avoided 'unsafe-inline' for scripts
- ✅ Used nonces for necessary inline scripts
- ❌ Avoided 'unsafe-eval'
- ✅ Whitelisted specific trusted domains
- ✅ Blocked object-src (Flash, plugins)
- ✅ Blocked frame-ancestors (clickjacking)

## Monitoring & Logging

### Production Monitoring

**Recommended:**
1. Set up CSP reporting endpoint
2. Monitor violation reports
3. Track blocked resources
4. Alert on new violation patterns

**Implementation (future enhancement):**
```typescript
// Add to CSP directives
'report-uri': ['/api/csp-violation-report'],
'report-to': ['csp-endpoint'],
```

### Logs to Monitor

- Build logs for compilation errors
- Server logs for middleware execution
- Browser console for CSP violations
- Analytics for tracking functionality

## Summary

### Files Modified/Created

**Created:**
- `web/middleware.ts`
- `web/lib/security/csp.ts`
- `web/lib/security/headers.ts`
- `web/lib/security/get-nonce.ts`
- `web/scripts/verify-security-headers.mjs`

**Modified:**
- `web/next.config.js`
- `web/components/analytics/google-analytics.tsx`
- `web/app/layout.tsx`

**Reviewed:**
- `web/vercel.json` (no changes needed)

### Deployment Checklist

- [x] Middleware configured for Edge Runtime
- [x] Security headers defined in headers.ts
- [x] CSP nonce generation implemented
- [x] Google Analytics updated with nonce support
- [x] Next.js config includes fallback headers
- [x] Vercel config compatible with security headers
- [x] Verification script created
- [x] Testing guides created
- [x] Deployment configuration documented

### Success Metrics

- ✅ Zero CSP violations in production
- ✅ All security headers present on all routes
- ✅ Google Analytics functioning with CSP
- ✅ No broken functionality due to CSP
- ✅ A+ rating on security header scanners

## References

- [Content Security Policy - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Google Analytics CSP Guide](https://developers.google.com/tag-platform/security/guides/csp)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
