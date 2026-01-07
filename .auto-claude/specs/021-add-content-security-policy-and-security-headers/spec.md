# Add Content Security Policy and security headers

## Overview

The Next.js application lacks Content Security Policy (CSP) and other important security headers like X-Frame-Options, X-Content-Type-Options, and Referrer-Policy. The google-analytics component uses dangerouslySetInnerHTML which requires proper CSP protection.

## Rationale

Security headers provide defense-in-depth against various attacks. CSP prevents XSS by controlling what scripts can execute. X-Frame-Options prevents clickjacking. The dangerouslySetInnerHTML usage in google-analytics.tsx (line 38) is a potential XSS vector if the measurement ID is ever tampered with.

---
*This spec was created from ideation and is pending detailed specification.*
