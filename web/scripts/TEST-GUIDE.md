# Waitlist Email Domain Test Guide

This guide helps you verify that the `maslowai.com` to `maslow.ai` domain fixes are working correctly.

## Quick Start

### 1. Automated Code Verification (✅ Already Completed)

- ✅ No `maslowai.com` references found in codebase
- ✅ All 6 files verified with correct `maslow.ai` domain:
  - `web/app/api/waitlist/route.ts` - Email from addresses
  - `web/app/layout.tsx` - Site URL
  - `web/app/sitemap.ts` - Base URL
  - `web/public/robots.txt` - Sitemap URL
  - `web/app/terms/page.tsx` - Contact email
  - `web/app/privacy/page.tsx` - Contact email

### 2. Run Automated API Test

```bash
# Make sure your Next.js dev server is running
cd web
npm run dev

# In another terminal, run the test script
node scripts/test-waitlist-email.mjs http://localhost:3000 your-test-email@example.com
```

The script will:
- Verify code has correct domain
- Send a test POST request to `/api/waitlist`
- Check for domain-related errors
- Provide verification checklist

### 3. Manual Verification Steps

#### 3.1 Verify Resend Domain Setup

1. Log into [Resend Dashboard](https://resend.com/domains)
2. Navigate to **Domains** section
3. Verify:
   - ✅ `maslow.ai` domain is listed and verified (green checkmark)
   - ✅ Domain status is "Verified" or "Active"
   - ✅ `maslowai.com` is NOT in the domain list
   - ✅ `rakesh@maslow.ai` is configured as a sending address

#### 3.2 Check Email Delivery

After running the test script:

1. **Check Test Email Inbox:**
   - Look for email from: `Think by Maslow AI <rakesh@maslow.ai>`
   - Subject: "You're on the Think waitlist!"
   - Verify waitlist position number is included

2. **Check Admin Email Inbox** (if `ADMIN_EMAIL` env var is set):
   - Look for email from: `Think Waitlist <rakesh@maslow.ai>`
   - Subject format: `New waitlist signup #<count>: <email>`
   - Verify signup details and total count

3. **Check Resend Email Logs:**
   - Navigate to [Resend Emails](https://resend.com/emails)
   - Find the test emails you just sent
   - Verify:
     - "From" field shows `rakesh@maslow.ai`
     - Status is "Delivered" or "Sent" (not "Failed")
     - No validation errors related to domain verification
     - No errors mentioning "maslowai.com domain is not verified"

#### 3.3 Verify Frontend URLs

1. **Check Metadata:**
   - View page source of your site
   - Verify OpenGraph and Twitter card URLs use `think.maslow.ai`
   - Check metadata base URL uses `think.maslow.ai`

2. **Check Sitemap:**
   - Visit `/sitemap.xml` on your site
   - Verify all URLs use `think.maslow.ai` domain

3. **Check Robots.txt:**
   - Visit `/robots.txt` on your site
   - Verify sitemap URL: `https://think.maslow.ai/sitemap.xml`

#### 3.4 Verify Contact Pages

1. **Terms Page:**
   - Navigate to `/terms`
   - Verify contact email shows `rakesh@maslow.ai`
   - Click mailto link - should open email client with `rakesh@maslow.ai`

2. **Privacy Page:**
   - Navigate to `/privacy`
   - Verify contact email shows `rakesh@maslow.ai`
   - Click mailto link - should open email client with `rakesh@maslow.ai`

## Success Criteria

All tests pass when:

- ✅ No `maslowai.com` references found in codebase
- ✅ Welcome emails sent successfully with `rakesh@maslow.ai`
- ✅ Admin notification emails sent successfully
- ✅ No Resend domain validation errors
- ✅ All URLs use `maslow.ai` domain
- ✅ Contact pages show correct email addresses
- ✅ Resend dashboard shows `maslow.ai` as verified domain

## Troubleshooting

### Email Not Received

1. Check Resend dashboard for email status
2. Verify `RESEND_API_KEY` environment variable is set correctly
3. Check spam/junk folder
4. Verify test email address is valid

### Domain Verification Error

1. Check Resend dashboard - ensure `maslow.ai` is verified
2. Verify DNS records are correctly configured
3. Check that `rakesh@maslow.ai` is set up as a sending address
4. Review server logs for detailed error messages

### API Errors

1. Verify all environment variables are set:
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL` (optional)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `ARCJET_KEY`

2. Check Redis connection (may affect email sending flow)
3. Verify Arcjet configuration (may block test emails)
4. Review server console logs for detailed errors

## Test Script Usage

```bash
# Basic usage (uses defaults: localhost:3000 and generated test email)
node web/scripts/test-waitlist-email.mjs

# Specify base URL
node web/scripts/test-waitlist-email.mjs http://localhost:3000

# Specify base URL and test email
node web/scripts/test-waitlist-email.mjs http://localhost:3000 test@example.com

# Test production URL (after deployment)
node web/scripts/test-waitlist-email.mjs https://think.maslow.ai test@example.com
```

## Production Deployment & Testing

### 1. Prepare Changes for Deployment

```bash
# Stage the domain fix files
git add web/app/api/waitlist/route.ts
git add web/app/layout.tsx
git add web/app/sitemap.ts
git add web/public/robots.txt
git add web/app/terms/page.tsx
git add web/app/privacy/page.tsx
git add web/scripts/test-waitlist-email.mjs
git add web/scripts/TEST-GUIDE.md

# Commit with descriptive message
git commit -m "fix: Update domain from maslowai.com to maslow.ai

- Fix Resend email from addresses to use rakesh@maslow.ai
- Update all URLs to use think.maslow.ai domain
- Update contact email addresses in terms and privacy pages
- Add test script and guide for email domain verification"

# Push to main branch (triggers Vercel auto-deployment)
git push origin main
```

### 2. Monitor Deployment

1. **Check Vercel Dashboard:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Monitor the deployment status
   - Wait for deployment to complete (usually 2-5 minutes)

2. **Verify Deployment:**
   - Check deployment logs for any build errors
   - Ensure all environment variables are set in Vercel:
     - `RESEND_API_KEY`
     - `ADMIN_EMAIL`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `ARCJET_KEY`
     - `NEXT_PUBLIC_APP_URL` (should be `https://think.maslow.ai`)

### 3. Test Production Deployment

Once deployment is complete:

```bash
# Test production API endpoint
node web/scripts/test-waitlist-email.mjs https://think.maslow.ai your-test-email@example.com
```

**Production Verification Checklist:**

1. ✅ **API Test:**
   - Run the test script against production URL
   - Verify no domain errors in response
   - Check response status is 200

2. ✅ **Email Delivery:**
   - Check test email inbox for welcome email
   - Verify "From" field: `Think by Maslow AI <rakesh@maslow.ai>`
   - Check admin email (if configured) for notification

3. ✅ **Resend Dashboard:**
   - Check [Resend Email Logs](https://resend.com/emails)
   - Verify emails show "From" as `rakesh@maslow.ai`
   - Verify status is "Delivered" or "Sent"
   - Confirm NO "maslowai.com domain is not verified" errors

4. ✅ **Frontend Verification:**
   - Visit `https://think.maslow.ai`
   - Check page source - verify metadata URLs use `think.maslow.ai`
   - Visit `https://think.maslow.ai/sitemap.xml` - verify URLs
   - Visit `https://think.maslow.ai/robots.txt` - verify sitemap URL
   - Visit `https://think.maslow.ai/terms` - verify contact email
   - Visit `https://think.maslow.ai/privacy` - verify contact email

### 4. Rollback Plan (if needed)

If issues are found in production:

```bash
# Revert the commit
git revert HEAD
git push origin main
```

Or manually fix and redeploy:
1. Make corrections locally
2. Commit and push again
3. Vercel will automatically redeploy

## Notes

- Use a test email address that you control for testing
- The test script will add the email to your waitlist (may need to clean up from Redis)
- Consider using Resend's test mode if available
- Document any issues found during testing
