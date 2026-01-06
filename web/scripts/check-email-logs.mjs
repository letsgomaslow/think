#!/usr/bin/env node

/**
 * Check Resend email logs programmatically
 * Shows recent emails and verifies domain usage
 * 
 * Usage:
 *   RESEND_API_KEY=your_key node web/scripts/check-email-logs.mjs [limit]
 * 
 * Example:
 *   RESEND_API_KEY=your_key node web/scripts/check-email-logs.mjs 10
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com';
const LIMIT = parseInt(process.argv[2]) || 10;

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

async function checkEmailLogs() {
  logSection('Resend Email Logs Check');
  
  if (!RESEND_API_KEY) {
    log('❌ RESEND_API_KEY environment variable is not set', 'red');
    log('   Set it with: export RESEND_API_KEY=your_api_key', 'yellow');
    return false;
  }
  
  try {
    log(`\n📡 Fetching last ${LIMIT} emails from Resend API...`, 'yellow');
    
    const response = await fetch(`${RESEND_API_URL}/emails?limit=${LIMIT}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log(`❌ Failed to fetch emails: ${response.status} ${response.statusText}`, 'red');
      if (errorData.message) {
        log(`   Error: ${errorData.message}`, 'red');
      }
      return false;
    }
    
    const data = await response.json();
    const emails = data.data || [];
    
    if (emails.length === 0) {
      log('\n⚠️  No emails found in logs', 'yellow');
      return true;
    }
    
    log(`\n✅ Found ${emails.length} email(s)`, 'green');
    
    let hasErrors = false;
    let correctDomainCount = 0;
    let incorrectDomainCount = 0;
    
    emails.forEach((email, index) => {
      log(`\n📧 Email #${index + 1}:`, 'blue');
      log(`   ID: ${email.id}`, 'blue');
      log(`   From: ${email.from}`, 'blue');
      log(`   To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`, 'blue');
      log(`   Subject: ${email.subject || 'N/A'}`, 'blue');
      log(`   Status: ${email.last_event || 'N/A'}`, 
          email.last_event === 'delivered' || email.last_event === 'sent' ? 'green' : 'yellow');
      log(`   Created: ${email.created_at || 'N/A'}`, 'blue');
      
      // Check for domain issues
      const fromAddress = email.from || '';
      
      if (fromAddress.includes('maslowai.com')) {
        log('   ❌ ERROR: Contains maslowai.com domain!', 'red');
        incorrectDomainCount++;
        hasErrors = true;
      } else if (fromAddress.includes('rakesh@maslow.ai')) {
        log('   ✅ Correct domain (rakesh@maslow.ai)', 'green');
        correctDomainCount++;
      } else if (fromAddress.includes('maslow.ai')) {
        log('   ⚠️  Uses maslow.ai but not rakesh@maslow.ai', 'yellow');
      }
      
      // Check for errors
      if (email.last_event === 'bounced' || email.last_event === 'failed') {
        log(`   ⚠️  Email ${email.last_event}`, 'yellow');
        hasErrors = true;
      }
    });
    
    logSection('Summary');
    log(`Total emails checked: ${emails.length}`, 'blue');
    log(`Correct domain (rakesh@maslow.ai): ${correctDomainCount}`, correctDomainCount > 0 ? 'green' : 'yellow');
    log(`Incorrect domain (maslowai.com): ${incorrectDomainCount}`, incorrectDomainCount === 0 ? 'green' : 'red');
    
    if (hasErrors) {
      log('\n⚠️  Issues found in email logs', 'yellow');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logSection('Error Details');
    log('❌ Failed to check email logs:', 'red');
    log(`   ${error.message}`, 'red');
    
    if (error.message.includes('fetch')) {
      log('\n💡 Tip: Check your internet connection and Resend API status', 'yellow');
    }
    
    return false;
  }
}

async function run() {
  log('\n📋 Resend Email Logs Checker', 'cyan');
  log(`   Checking last ${LIMIT} emails\n`, 'cyan');
  
  const success = await checkEmailLogs();
  
  logSection('Check Summary');
  
  if (success) {
    log('✅ Email logs check: PASSED', 'green');
    log('   No domain issues found in recent emails', 'green');
    process.exit(0);
  } else {
    log('❌ Email logs check: FAILED', 'red');
    log('   Issues found in email logs. Please review above.', 'yellow');
    process.exit(1);
  }
}

run().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
