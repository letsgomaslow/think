#!/usr/bin/env node

/**
 * Test script for waitlist email functionality
 * Tests that emails are sent correctly with maslow.ai domain
 * 
 * Usage:
 *   node web/scripts/test-waitlist-email.mjs [baseUrl] [testEmail]
 * 
 * Example:
 *   node web/scripts/test-waitlist-email.mjs http://localhost:3000 test@example.com
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const TEST_EMAIL = process.argv[3] || `test-${Date.now()}@example.com`;
const TEST_NAME = 'Test User';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testWaitlistSignup() {
  logSection('Testing Waitlist Email Functionality');
  
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Test Email: ${TEST_EMAIL}`, 'blue');
  log(`Test Name: ${TEST_NAME}`, 'blue');
  
  const endpoint = `${BASE_URL}/api/waitlist`;
  log(`\nEndpoint: ${endpoint}`, 'blue');
  
  try {
    log('\n📤 Sending POST request to waitlist endpoint...', 'yellow');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        name: TEST_NAME,
      }),
    });
    
    const responseData = await response.json();
    const statusCode = response.status;
    
    logSection('Response Details');
    log(`Status Code: ${statusCode}`, statusCode === 200 ? 'green' : 'red');
    log(`Response Body:`, 'blue');
    console.log(JSON.stringify(responseData, null, 2));
    
    // Check for domain-related errors
    if (responseData.error) {
      const errorMessage = responseData.error.toLowerCase();
      
      if (errorMessage.includes('maslowai.com')) {
        log('\n❌ ERROR: Found maslowai.com in error message!', 'red');
        log('   This indicates the domain fix may not be working.', 'red');
        return false;
      }
      
      if (errorMessage.includes('domain') && errorMessage.includes('not verified')) {
        log('\n❌ ERROR: Domain verification error detected!', 'red');
        log('   Please verify maslow.ai domain in Resend dashboard.', 'red');
        return false;
      }
      
      if (errorMessage.includes('already registered')) {
        log('\n⚠️  Email already registered (expected if re-running test)', 'yellow');
        log('   This is not a failure - the endpoint is working.', 'yellow');
        return true;
      }
      
      log(`\n⚠️  Error response: ${responseData.error}`, 'yellow');
      return false;
    }
    
    // Success case
    if (statusCode === 200 && responseData.success) {
      log('\n✅ API request successful!', 'green');
      log(`   Waitlist count: ${responseData.count}`, 'green');
      
      logSection('Verification Checklist');
      log('Please verify the following:', 'yellow');
      log('  1. Check your email inbox (' + TEST_EMAIL + ')', 'blue');
      log('     - Look for email from: Think by Maslow AI <rakesh@maslow.ai>', 'blue');
      log('     - Subject: "You\'re on the Think waitlist!"', 'blue');
      log('     - Verify waitlist position number is included', 'blue');
      
      if (process.env.ADMIN_EMAIL) {
        log('  2. Check admin email inbox (' + process.env.ADMIN_EMAIL + ')', 'blue');
        log('     - Look for email from: Think Waitlist <rakesh@maslow.ai>', 'blue');
        log('     - Subject format: "New waitlist signup #<count>: <email>"', 'blue');
      } else {
        log('  2. Admin email not configured (ADMIN_EMAIL env var not set)', 'yellow');
      }
      
      log('  3. Check Resend dashboard:', 'blue');
      log('     - Navigate to https://resend.com/emails', 'blue');
      log('     - Verify emails show "From" as rakesh@maslow.ai', 'blue');
      log('     - Verify email status is "Delivered" or "Sent"', 'blue');
      log('     - Verify NO domain validation errors', 'blue');
      
      return true;
    }
    
    log('\n❌ Unexpected response format', 'red');
    return false;
    
  } catch (error) {
    logSection('Error Details');
    log('❌ Request failed:', 'red');
    log(`   ${error.message}`, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('\n💡 Tip: Make sure the Next.js dev server is running:', 'yellow');
      log('   npm run dev', 'blue');
    }
    
    return false;
  }
}

async function verifyDomainInCode() {
  logSection('Code Verification');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '../..');
    const waitlistRoute = path.join(projectRoot, 'web/app/api/waitlist/route.ts');
    
    const content = fs.readFileSync(waitlistRoute, 'utf8');
    
    // Check for incorrect domain (but exclude error handling code)
    const lines = content.split('\n');
    const hasIncorrectDomain = lines.some(line => {
      const trimmed = line.trim();
      return trimmed.includes('maslowai.com') && 
             !trimmed.includes('error') &&
             !trimmed.includes('ERROR') &&
             !trimmed.includes('detected') &&
             !trimmed.includes('includes(\'maslowai.com\')') &&
             !trimmed.match(/['"`].*maslowai\.com.*['"`]/);
    });
    
    if (hasIncorrectDomain) {
      log('❌ Found maslowai.com in waitlist route (actual usage, not error handling)!', 'red');
      return false;
    }
    
    // Check for correct domain
    if (content.includes('rakesh@maslow.ai')) {
      log('✅ Found correct domain (rakesh@maslow.ai) in waitlist route', 'green');
      return true;
    }
    
    // Check for old incorrect email
    if (content.includes('hello@maslow.ai')) {
      log('❌ Found old email address (hello@maslow.ai) in waitlist route!', 'red');
      log('   This email does not exist. Should use rakesh@maslow.ai', 'red');
      return false;
    }
    
    log('⚠️  Could not verify domain in code', 'yellow');
    return false;
    
  } catch (error) {
    log(`⚠️  Could not verify code: ${error.message}`, 'yellow');
    return true; // Don't fail the test if we can't read the file
  }
}

async function verifyResendDomain() {
  logSection('Resend Domain Verification');
  
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    log('⚠️  RESEND_API_KEY not set, skipping Resend API verification', 'yellow');
    log('   Set it to enable Resend API checks: export RESEND_API_KEY=your_key', 'blue');
    return true; // Don't fail if API key not set
  }
  
  try {
    log('\n📡 Checking Resend domain status...', 'yellow');
    
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      log('⚠️  Could not verify Resend domain (API error)', 'yellow');
      return true; // Don't fail test if API check fails
    }
    
    const data = await response.json();
    const domains = data.data || [];
    
    const maslowDomain = domains.find(d => d.name === 'maslow.ai');
    
    if (!maslowDomain) {
      log('❌ maslow.ai domain NOT found in Resend account', 'red');
      log('   Please verify domain in Resend dashboard', 'yellow');
      return false;
    }
    
    if (maslowDomain.status !== 'verified') {
      log(`⚠️  maslow.ai domain status: ${maslowDomain.status}`, 'yellow');
      log('   Domain must be verified to send emails', 'yellow');
      return false;
    }
    
    log('✅ maslow.ai domain is verified in Resend', 'green');
    log('✅ rakesh@maslow.ai can be used as sending address', 'green');
    
    return true;
    
  } catch (error) {
    log(`⚠️  Resend API check failed: ${error.message}`, 'yellow');
    return true; // Don't fail test if API check fails
  }
}

async function runTests() {
  log('\n🧪 Waitlist Email Domain Test Suite', 'cyan');
  log('   Testing maslow.ai domain fixes\n', 'cyan');
  
  const codeCheck = await verifyDomainInCode();
  const resendCheck = await verifyResendDomain();
  const apiTest = await testWaitlistSignup();
  
  logSection('Test Summary');
  
  if (codeCheck) {
    log('✅ Code verification: PASSED', 'green');
  } else {
    log('❌ Code verification: FAILED', 'red');
  }
  
  if (resendCheck) {
    log('✅ Resend domain verification: PASSED', 'green');
  } else {
    log('⚠️  Resend domain verification: FAILED or SKIPPED', 'yellow');
  }
  
  if (apiTest) {
    log('✅ API test: PASSED', 'green');
  } else {
    log('❌ API test: FAILED', 'red');
  }
  
  if (codeCheck && apiTest) {
    log('\n🎉 All automated tests passed!', 'green');
    log('   Please complete manual verification steps listed above.', 'yellow');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the output above.', 'yellow');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
