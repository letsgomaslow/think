# Manual Testing Guide - Security Headers Implementation

## Overview
This guide provides step-by-step instructions for manually testing the Content Security Policy (CSP) and security headers implementation to ensure the application works correctly with no CSP violations.

## Prerequisites
- Development server must be running (`npm run dev` in web directory)
- Modern web browser with developer tools (Chrome, Firefox, or Edge recommended)
- Google Analytics measurement ID configured (if testing GA functionality)

---

## Testing Checklist

### 1. Start Development Server

```bash
cd web
npm run dev
```

**Expected Result:**
- Server starts successfully on http://localhost:3000
- No build errors or warnings
- Console shows "Ready in X ms"

**Status:** ⬜ Pass / ⬜ Fail

---

### 2. Verify Security Headers Are Present

#### Option A: Using the Verification Script
```bash
# From the project root
node web/scripts/verify-security-headers.mjs
```

**Expected Result:**
- All security headers present (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security)
- CSP contains nonce for inline scripts
- CSP includes Google Analytics domains
- Script exits with success (green checkmarks)

**Status:** ⬜ Pass / ⬜ Fail

#### Option B: Manual Browser Inspection
1. Open http://localhost:3000 in browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh the page
5. Click on the first document request
6. Go to Headers section
7. Scroll to Response Headers

**Expected Headers:**
- ✅ `content-security-policy` - contains nonce and Google Analytics domains
- ✅ `x-frame-options: DENY`
- ✅ `x-content-type-options: nosniff`
- ✅ `referrer-policy: strict-origin-when-cross-origin`
- ✅ `permissions-policy` - contains camera=(), microphone=(), geolocation=()
- ✅ `strict-transport-security` - contains max-age

**Status:** ⬜ Pass / ⬜ Fail

---

### 3. Check for CSP Violations

1. Open http://localhost:3000 in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Clear console
5. Navigate through all pages of the application

**Expected Result:**
- ❌ NO CSP violation errors in console
- ❌ NO "Refused to execute inline script" errors
- ❌ NO "Refused to load the script" errors
- ❌ NO "Refused to apply inline style" errors

**CSP Violation Examples to Look For (should NOT appear):**
```
❌ Refused to execute inline script because it violates the following Content Security Policy directive...
❌ Refused to load the script 'https://...' because it violates the following Content Security Policy directive...
❌ Refused to apply inline style because it violates the following Content Security Policy directive...
```

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any CSP violations found here]
```

---

### 4. Verify Google Analytics Functionality

1. Open http://localhost:3000
2. Open Developer Tools (F12)
3. Go to Network tab
4. Filter by "google-analytics" or "gtag"
5. Navigate to different pages

**Expected Result:**
- ✅ Google Tag Manager script loads: `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
- ✅ Analytics requests are sent: `https://www.google-analytics.com/g/collect`
- ✅ Page view events are tracked when navigating
- ❌ NO CSP violations related to Google Analytics scripts

**Check in Console:**
- Type `window.gtag` - should be a function
- Type `window.dataLayer` - should be an array

**Status:** ⬜ Pass / ⬜ Fail

**Notes:**
```
[Record any GA issues here]
```

---

### 5. Test Page Loading and Navigation

Test all main pages load correctly:

1. **Home Page** (/)
   - ⬜ Page loads without errors
   - ⬜ No CSP violations in console
   - ⬜ All images load correctly
   - ⬜ All fonts render correctly

2. **Additional Pages** (if applicable)
   - ⬜ All pages load without errors
   - ⬜ No CSP violations
   - ⬜ Navigation works smoothly

**Status:** ⬜ Pass / ⬜ Fail

---

### 6. Test Interactive Components

#### Theme Switching (if applicable)
1. Locate theme toggle/switcher
2. Toggle between light/dark mode

**Expected Result:**
- ✅ Theme changes apply correctly
- ✅ No CSP violations when switching themes
- ✅ Inline styles (if any) work with CSP

**Status:** ⬜ Pass / ⬜ Fail

#### Animations and Transitions
1. Observe page transitions
2. Check hover effects
3. Test any animated components

**Expected Result:**
- ✅ All animations work smoothly
- ✅ No CSP violations from animation scripts
- ✅ CSS animations work correctly

**Status:** ⬜ Pass / ⬜ Fail

#### Forms and Input (if applicable)
1. Test any forms on the site
2. Submit forms
3. Check validation

**Expected Result:**
- ✅ Forms work correctly
- ✅ No CSP violations from form scripts
- ✅ Form submission works as expected

**Status:** ⬜ Pass / ⬜ Fail

---

### 7. Test External Resources

1. Check Network tab for all resource loads
2. Verify images load from allowed sources
3. Verify fonts load from allowed sources
4. Verify API calls work (if applicable)

**Expected Resources Should Load:**
- ✅ Self-hosted resources (`'self'`)
- ✅ Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`)
- ✅ Google Analytics (`https://www.google-analytics.com`, `https://www.googletagmanager.com`)
- ✅ Data URIs for images (`data:`)

**Status:** ⬜ Pass / ⬜ Fail

---

### 8. Test in Multiple Browsers

Repeat key tests in different browsers:

#### Chrome/Chromium
- ⬜ No CSP violations
- ⬜ All functionality works
- ⬜ Google Analytics tracks correctly

#### Firefox
- ⬜ No CSP violations
- ⬜ All functionality works
- ⬜ Google Analytics tracks correctly

#### Safari (if available)
- ⬜ No CSP violations
- ⬜ All functionality works
- ⬜ Google Analytics tracks correctly

**Status:** ⬜ Pass / ⬜ Fail

---

### 9. Performance and Console Check

1. Open Console tab
2. Look for any warnings or errors (not just CSP)

**Expected Result:**
- ❌ NO errors in console
- ❌ NO warnings about security headers
- ✅ Clean console output

**Status:** ⬜ Pass / ⬜ Fail

---

## Testing Summary

| Test Category | Status | Notes |
|--------------|--------|-------|
| Server Start | ⬜ Pass / ⬜ Fail | |
| Security Headers Present | ⬜ Pass / ⬜ Fail | |
| No CSP Violations | ⬜ Pass / ⬜ Fail | |
| Google Analytics Works | ⬜ Pass / ⬜ Fail | |
| Page Loading | ⬜ Pass / ⬜ Fail | |
| Interactive Components | ⬜ Pass / ⬜ Fail | |
| External Resources | ⬜ Pass / ⬜ Fail | |
| Browser Compatibility | ⬜ Pass / ⬜ Fail | |
| Console Clean | ⬜ Pass / ⬜ Fail | |

---

## Common Issues and Troubleshooting

### Issue: CSP violation for inline scripts
**Cause:** Script without nonce attribute
**Solution:** Ensure script has `nonce={nonce}` attribute

### Issue: CSP violation for external scripts
**Cause:** Script domain not in CSP allowlist
**Solution:** Add domain to CSP configuration in `web/lib/security/headers.ts`

### Issue: Theme switching causes CSP violation
**Cause:** Inline styles without proper CSP directive
**Solution:** Check `style-src` directive includes `'unsafe-inline'` for styled-components/CSS-in-JS

### Issue: Google Analytics not loading
**Cause:** CSP blocking Google Analytics domains
**Solution:** Verify Google Analytics domains in CSP:
- `https://www.googletagmanager.com`
- `https://www.google-analytics.com`

### Issue: Fonts not loading
**Cause:** Font domains not in CSP allowlist
**Solution:** Ensure `font-src` includes:
- `'self'`
- `https://fonts.gstatic.com`

---

## Final Verification

Before marking this subtask as complete:

- ✅ All tests in checklist completed
- ✅ No CSP violations found
- ✅ Google Analytics functioning correctly
- ✅ All interactive components working
- ✅ No broken functionality
- ✅ Tested in at least 2 browsers
- ✅ Security headers verified present

**Overall Testing Status:** ⬜ PASS / ⬜ FAIL

**Tested By:** _________________

**Date:** _________________

**Additional Notes:**
```
[Add any additional observations or issues here]
```

---

## Next Steps

After completing manual testing:

1. ✅ Update this document with test results
2. ✅ Fix any issues found during testing
3. ✅ Re-test after fixes
4. ✅ Mark subtask 4.2 as completed in implementation_plan.json
5. ✅ Update build-progress.txt
6. ✅ Commit changes with message: "auto-claude: 4.2 - Perform manual testing to ensure the application w"
7. ➡️ Proceed to subtask 4.3 - Build and production verification
