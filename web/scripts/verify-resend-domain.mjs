#!/usr/bin/env node

/**
 * Verify Resend domain status using Resend API
 * Checks if maslow.ai domain is verified and rakesh@maslow.ai can be used
 * 
 * Usage:
 *   RESEND_API_KEY=your_key node web/scripts/verify-resend-domain.mjs
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com';

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

async function checkResendDomains() {
  logSection('Resend Domain Verification');
  
  if (!RESEND_API_KEY) {
    log('❌ RESEND_API_KEY environment variable is not set', 'red');
    log('   Set it with: export RESEND_API_KEY=your_api_key', 'yellow');
    return false;
  }
  
  try {
    log('\n📡 Fetching domains from Resend API...', 'yellow');
    
    const response = await fetch(`${RESEND_API_URL}/domains`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      log(`❌ Failed to fetch domains: ${response.status} ${response.statusText}`, 'red');
      if (errorData.message) {
        log(`   Error: ${errorData.message}`, 'red');
      }
      return false;
    }
    
    const data = await response.json();
    const domains = data.data || [];
    
    log(`\n✅ Found ${domains.length} domain(s) in Resend account`, 'green');
    
    // Check for maslow.ai domain
    const maslowDomain = domains.find(d => d.name === 'maslow.ai');
    
    if (!maslowDomain) {
      log('\n❌ maslow.ai domain NOT found in Resend account', 'red');
      log('   Please add and verify maslow.ai domain in Resend dashboard', 'yellow');
      log('   Visit: https://resend.com/domains', 'blue');
      return false;
    }
    
    log('\n✅ maslow.ai domain found', 'green');
    log(`   Domain: ${maslowDomain.name}`, 'blue');
    log(`   Status: ${maslowDomain.status}`, maslowDomain.status === 'verified' ? 'green' : 'yellow');
    log(`   Region: ${maslowDomain.region || 'N/A'}`, 'blue');
    
    if (maslowDomain.status !== 'verified') {
      log('\n⚠️  Domain is not verified!', 'yellow');
      log('   Please complete domain verification in Resend dashboard', 'yellow');
      return false;
    }
    
    // Check for incorrect domain
    const incorrectDomain = domains.find(d => d.name === 'maslowai.com');
    if (incorrectDomain) {
      log('\n⚠️  WARNING: maslowai.com domain found in Resend account', 'yellow');
      log('   This domain should not exist. Consider removing it.', 'yellow');
    }
    
    // Verify rakesh@maslow.ai can be used
    log('\n📧 Verifying email address: rakesh@maslow.ai', 'blue');
    log('   Domain is verified, so rakesh@maslow.ai should work as sending address', 'green');
    
    return true;
    
  } catch (error) {
    logSection('Error Details');
    log('❌ Failed to verify domains:', 'red');
    log(`   ${error.message}`, 'red');
    
    if (error.message.includes('fetch')) {
      log('\n💡 Tip: Check your internet connection and Resend API status', 'yellow');
    }
    
    return false;
  }
}

async function run() {
  log('\n🔍 Resend Domain Verification Script', 'cyan');
  log('   Checking maslow.ai domain status\n', 'cyan');
  
  const success = await checkResendDomains();
  
  logSection('Verification Summary');
  
  if (success) {
    log('✅ Domain verification: PASSED', 'green');
    log('   maslow.ai is verified and ready to use', 'green');
    log('   rakesh@maslow.ai can be used as sending address', 'green');
    process.exit(0);
  } else {
    log('❌ Domain verification: FAILED', 'red');
    log('   Please fix the issues above before deploying', 'yellow');
    process.exit(1);
  }
}

run().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
