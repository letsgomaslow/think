# Add input validation to waitlist API name parameter

## Overview

The waitlist API endpoint at /api/waitlist/route.ts stores user-provided 'name' directly to Redis without sanitization. The name is also included in HTML emails sent via Resend, creating a potential stored XSS vulnerability in email clients.

## Rationale

While the email field is validated via Arcjet, the name field has no validation or sanitization. Malicious input like '<script>alert(1)</script>' could be stored in Redis and rendered in admin notification emails, potentially leading to stored XSS in email clients that render HTML.

---
*This spec was created from ideation and is pending detailed specification.*
