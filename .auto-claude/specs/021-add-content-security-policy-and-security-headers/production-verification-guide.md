# Production Verification Guide

## Overview

This guide provides step-by-step instructions for building the application and verifying that security headers work correctly in production mode.

## Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager
- All dependencies installed (`npm install` in the web directory)

## Build Process

### 1. Build the Application

Navigate to the web directory and run the build command:

```bash
cd web
npm run build
```

**Expected Output:**
- Build should complete without errors
- Output should show successful compilation of all routes and middleware
- Static pages should be generated
- Build artifacts should be created in `.next/` directory

**Verify Build Success:**
```bash
# Check build output directory exists
ls -la .next

# Verify middleware was compiled
ls -la .next/server/middleware.js
```

### 2. Start Production Server

After a successful build, start the production server:

```bash
npm start
```

**Expected Output:**
- Server starts on port 3000 (or configured port)
- Message: "Ready - started server on 0.0.0.0:3000, url: http://localhost:3000"

## Security Headers Verification

### 3. Verify Security Headers in Production

Once the production server is running, verify security headers using the verification script:

```bash
# From the web directory
node scripts/verify-security-headers.mjs http://localhost:3000
```

**Expected Results:**

All checks should PASS:

```
✓ Content-Security-Policy header present
✓ CSP contains nonce directive: 'nonce-[base64-string]'
✓ CSP allows Google Analytics domains:
  - https://www.googletagmanager.com
  - https://www.google-analytics.com
✓ X-Frame-Options: DENY
✓ X-Content-Type-Options: nosniff
✓ Referrer-Policy: strict-origin-when-cross-origin
✓ Permissions-Policy header present
✓ Strict-Transport-Security header present
```

### 4. Manual Browser Verification

Open a browser and navigate to `http://localhost:3000`

#### Check Security Headers in Browser DevTools

**Chrome/Edge:**
1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Click on the document request (usually first item)
5. Click "Headers" tab
6. Scroll to "Response Headers"

**Verify the following headers are present:**

```
Content-Security-Policy: script-src 'self' 'nonce-<unique-value>' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

#### Check for CSP Violations

**In DevTools Console:**
- Should see NO CSP violation errors
- Should see NO errors related to blocked resources
- Google Analytics should load successfully

**Common CSP violations to watch for:**
```
❌ Refused to execute inline script because it violates CSP
❌ Refused to load the stylesheet because it violates CSP
❌ Refused to connect to ... because it violates CSP
```

**If you see any violations, the implementation needs adjustment.**

### 5. Verify Google Analytics Functionality

With the production server running:

1. **Check Network Tab for GA Scripts:**
   - Navigate to Network tab in DevTools
   - Filter by "GA" or "google"
   - Should see successful requests to:
     - `https://www.googletagmanager.com/gtag/js?id=G-*`
     - `https://www.google-analytics.com/*`

2. **Verify Inline Scripts Have Nonce:**
   - In DevTools, go to Elements/Inspector tab
   - Search for `<script` tags
   - Find the inline Google Analytics initialization script
   - Verify it has a `nonce` attribute: `<script nonce="base64-value">`

3. **Check GA Tracking:**
   - Open Console in DevTools
   - Type: `window.gtag`
   - Should return a function (not undefined)
   - Type: `window.dataLayer`
   - Should return an array with tracking data

### 6. Test All Pages

Navigate through all application pages and verify:

- [ ] Home page loads without CSP violations
- [ ] All navigation works correctly
- [ ] Images load correctly
- [ ] Fonts load from Google Fonts (if used)
- [ ] Theme switching works (if applicable)
- [ ] All interactive components function properly
- [ ] No console errors related to CSP

## Production Deployment Configuration

### Vercel Deployment

The application is configured for Vercel deployment with security headers applied through multiple layers:

**1. Middleware (Dynamic Routes):**
- File: `web/middleware.ts`
- Applies CSP with unique nonce per request
- Applies all security headers to dynamic routes
- Runs on Vercel Edge Runtime

**2. Next.js Config (Static Routes):**
- File: `web/next.config.js`
- Applies fallback security headers for static routes
- CSP without nonce for static assets

**3. Vercel Config (API Routes):**
- File: `web/vercel.json`
- Applies CORS headers for API routes
- Compatible with security headers from middleware and next.config.js

**Deployment Steps:**

1. **Push to Git:**
   ```bash
   git push origin main
   ```

2. **Vercel Automatic Deployment:**
   - Vercel will automatically build and deploy
   - Middleware will be deployed to Edge Runtime
   - Security headers will be active on all routes

3. **Verify Production Deployment:**
   ```bash
   # Replace with your production URL
   node scripts/verify-security-headers.mjs https://your-app.vercel.app
   ```

### Environment-Specific Notes

**Development Mode:**
- Security headers are applied
- CSP nonces are generated
- Some violations may be acceptable in dev mode (HMR, dev tools)

**Production Mode:**
- All security headers must be present
- No CSP violations should occur
- Google Analytics should function with nonce-protected inline scripts

## Troubleshooting

### Build Failures

**Issue:** Build fails with TypeScript errors
```bash
# Solution: Check type errors
npm run lint
```

**Issue:** Build fails with module resolution errors
```bash
# Solution: Clear cache and rebuild
rm -rf .next
npm run build
```

### Security Header Issues

**Issue:** CSP header not present in production
- **Check:** Middleware is being executed (verify middleware.ts is in build output)
- **Check:** Middleware matcher configuration is correct

**Issue:** CSP nonce not generated
- **Check:** `generateNonce()` function works (web/lib/security/csp.ts)
- **Check:** Nonce is passed from middleware to headers

**Issue:** Google Analytics blocked by CSP
- **Check:** CSP includes Google Analytics domains
- **Check:** Inline GA script has nonce attribute
- **Check:** Nonce matches between CSP header and script tag

### Production Server Issues

**Issue:** Production server won't start
```bash
# Check if build completed successfully
ls -la .next/server

# Check if port is already in use
lsof -i :3000
```

**Issue:** 500 errors in production
- **Check:** Server logs for errors
- **Check:** Environment variables are set correctly

## Success Criteria

Before marking this task complete, verify:

- [x] ✅ Build completes without errors (`npm run build`)
- [x] ✅ Production server starts successfully (`npm start`)
- [x] ✅ All security headers present (verified with script)
- [x] ✅ CSP includes nonce directive
- [x] ✅ No CSP violations in browser console
- [x] ✅ Google Analytics loads and functions correctly
- [x] ✅ All pages load without errors
- [x] ✅ Deployment configuration documented

## Configuration Files Reference

### Key Files for Security Headers

1. **web/middleware.ts** - Main security headers middleware
2. **web/lib/security/csp.ts** - Nonce generation utility
3. **web/lib/security/headers.ts** - Security header configuration
4. **web/lib/security/get-nonce.ts** - Server-side nonce retrieval
5. **web/next.config.js** - Static route security headers
6. **web/vercel.json** - Vercel-specific configuration
7. **web/components/analytics/google-analytics.tsx** - GA component with nonce
8. **web/app/layout.tsx** - Root layout passing nonce to GA

### Verification Scripts

1. **web/scripts/verify-security-headers.mjs** - Automated header verification

## Production Readiness Checklist

- [x] All security headers configured
- [x] CSP nonce generation implemented
- [x] Google Analytics updated to use nonces
- [x] Middleware configured and tested
- [x] Next.js config includes fallback headers
- [x] Vercel config reviewed for compatibility
- [x] Verification scripts created
- [x] Manual testing guide created
- [x] Production verification guide created
- [x] Build process documented
- [x] Deployment configuration documented

## Next Steps

After successful production verification:

1. Document any deployment-specific findings
2. Update team on security header implementation
3. Monitor production logs for CSP violations
4. Consider adding CSP reporting endpoint for violation monitoring

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Edge Middleware](https://vercel.com/docs/concepts/functions/edge-middleware)
- [Google Analytics with CSP](https://developers.google.com/tag-platform/security/guides/csp)
