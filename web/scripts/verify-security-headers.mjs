#!/usr/bin/env node

/**
 * Verify security headers are present and correctly configured
 * Tests for CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and other security headers
 *
 * Usage:
 *   # Test against local dev server (default: http://localhost:3000)
 *   node web/scripts/verify-security-headers.mjs
 *
 *   # Test against custom URL
 *   URL=https://example.com node web/scripts/verify-security-headers.mjs
 */

const TEST_URL = process.env.URL || 'http://localhost:3000';

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

/**
 * Expected security headers configuration
 */
const EXPECTED_HEADERS = {
  'x-frame-options': {
    name: 'X-Frame-Options',
    expected: 'DENY',
    description: 'Prevents clickjacking by blocking iframe embedding',
  },
  'x-content-type-options': {
    name: 'X-Content-Type-Options',
    expected: 'nosniff',
    description: 'Prevents MIME type sniffing',
  },
  'referrer-policy': {
    name: 'Referrer-Policy',
    expected: 'strict-origin-when-cross-origin',
    description: 'Controls referrer information sent with requests',
  },
  'permissions-policy': {
    name: 'Permissions-Policy',
    expectedPattern: /camera=\(\)/,
    description: 'Controls browser features and APIs',
  },
  'strict-transport-security': {
    name: 'Strict-Transport-Security',
    expectedPattern: /max-age=\d+/,
    description: 'Forces HTTPS connections',
  },
  'content-security-policy': {
    name: 'Content-Security-Policy',
    expectedPatterns: [
      /default-src 'self'/,
      /script-src/,
      /style-src/,
      /img-src/,
      /font-src/,
      /connect-src/,
      /frame-ancestors 'none'/,
      /base-uri 'self'/,
      /form-action 'self'/,
      /object-src 'none'/,
    ],
    description: 'Prevents XSS by controlling resource loading',
  },
};

/**
 * Check if CSP contains Google Analytics domains
 */
function checkCSPGoogleAnalytics(cspValue) {
  const requiredDomains = [
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ];

  const results = [];
  for (const domain of requiredDomains) {
    if (cspValue.includes(domain)) {
      results.push({ domain, present: true });
    } else {
      results.push({ domain, present: false });
    }
  }

  return results;
}

/**
 * Check if CSP contains nonce
 */
function checkCSPNonce(cspValue) {
  // Look for 'nonce-' followed by base64-like characters
  const noncePattern = /'nonce-[A-Za-z0-9+/=]+'/;
  const hasNonce = noncePattern.test(cspValue);

  if (hasNonce) {
    const match = cspValue.match(/'nonce-([A-Za-z0-9+/=]+)'/);
    return { hasNonce: true, nonce: match ? match[1] : null };
  }

  return { hasNonce: false, nonce: null };
}

/**
 * Verify security headers from HTTP response
 */
async function verifySecurityHeaders() {
  logSection('Security Headers Verification');
  log(`\n🌐 Testing URL: ${TEST_URL}`, 'blue');

  let response;
  try {
    log('\n📡 Fetching headers...', 'yellow');
    response = await fetch(TEST_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      log(`⚠️  HTTP ${response.status}: ${response.statusText}`, 'yellow');
      log('   Continuing with header verification...', 'yellow');
    } else {
      log(`✅ HTTP ${response.status}: Server is responding`, 'green');
    }
  } catch (error) {
    log(`❌ Failed to connect to ${TEST_URL}`, 'red');
    log(`   Error: ${error.message}`, 'red');

    if (error.message.includes('ECONNREFUSED')) {
      log('\n💡 Tip: Make sure the development server is running:', 'yellow');
      log('   Run: npm run dev', 'blue');
    }

    return { success: false, errors: ['Failed to connect to server'] };
  }

  const errors = [];
  const warnings = [];
  const headers = {};

  // Extract headers (case-insensitive)
  for (const [key, value] of response.headers.entries()) {
    headers[key.toLowerCase()] = value;
  }

  logSection('Header Verification Results');

  // Check each expected header
  for (const [headerKey, config] of Object.entries(EXPECTED_HEADERS)) {
    const headerValue = headers[headerKey];

    if (!headerValue) {
      log(`\n❌ ${config.name}: MISSING`, 'red');
      log(`   ${config.description}`, 'yellow');
      errors.push(`${config.name} header is missing`);
      continue;
    }

    log(`\n✅ ${config.name}: PRESENT`, 'green');
    log(`   Value: ${headerValue}`, 'blue');
    log(`   ${config.description}`, 'cyan');

    // Verify exact value if expected
    if (config.expected && headerValue !== config.expected) {
      log(`   ⚠️  Expected: ${config.expected}`, 'yellow');
      warnings.push(`${config.name} value doesn't match expected: got "${headerValue}", expected "${config.expected}"`);
    }

    // Verify pattern if expectedPattern
    if (config.expectedPattern && !config.expectedPattern.test(headerValue)) {
      log(`   ⚠️  Pattern not matched: ${config.expectedPattern}`, 'yellow');
      warnings.push(`${config.name} doesn't match expected pattern`);
    }

    // Verify multiple patterns if expectedPatterns (for CSP)
    if (config.expectedPatterns) {
      const missingDirectives = [];
      for (const pattern of config.expectedPatterns) {
        if (!pattern.test(headerValue)) {
          missingDirectives.push(pattern.toString());
        }
      }

      if (missingDirectives.length > 0) {
        log(`   ⚠️  Missing directives:`, 'yellow');
        for (const directive of missingDirectives) {
          log(`      - ${directive}`, 'yellow');
        }
        warnings.push(`${config.name} missing some expected directives`);
      }

      // Special CSP checks
      if (headerKey === 'content-security-policy') {
        // Check for Google Analytics domains
        log(`\n   📊 Google Analytics Integration:`, 'cyan');
        const gaDomains = checkCSPGoogleAnalytics(headerValue);
        for (const { domain, present } of gaDomains) {
          if (present) {
            log(`      ✅ ${domain}`, 'green');
          } else {
            log(`      ❌ ${domain} - MISSING`, 'red');
            errors.push(`CSP missing Google Analytics domain: ${domain}`);
          }
        }

        // Check for nonce
        log(`\n   🔐 CSP Nonce:`, 'cyan');
        const { hasNonce, nonce } = checkCSPNonce(headerValue);
        if (hasNonce) {
          log(`      ✅ Nonce present: ${nonce}`, 'green');
          log(`      Length: ${nonce?.length || 0} characters`, 'blue');
        } else {
          log(`      ⚠️  No nonce found in CSP`, 'yellow');
          warnings.push('CSP does not contain nonce for inline scripts (may be expected for static routes)');
        }
      }
    }
  }

  return { success: errors.length === 0, errors, warnings, headers };
}

async function run() {
  log('\n🔒 Security Headers Verification Script', 'cyan');
  log('   Checking for Content Security Policy and security headers\n', 'cyan');

  const result = await verifySecurityHeaders();

  logSection('Verification Summary');

  // Display warnings
  if (result.warnings && result.warnings.length > 0) {
    log('\n⚠️  Warnings:', 'yellow');
    for (const warning of result.warnings) {
      log(`   - ${warning}`, 'yellow');
    }
  }

  // Display errors
  if (result.errors && result.errors.length > 0) {
    log('\n❌ Errors:', 'red');
    for (const error of result.errors) {
      log(`   - ${error}`, 'red');
    }
  }

  // Final result
  console.log('\n');
  if (result.success) {
    log('✅ Security Headers Verification: PASSED', 'green');
    log('   All required security headers are present and configured correctly', 'green');

    if (result.warnings && result.warnings.length > 0) {
      log(`   ${result.warnings.length} warning(s) noted above`, 'yellow');
    }

    process.exit(0);
  } else {
    log('❌ Security Headers Verification: FAILED', 'red');
    log(`   Found ${result.errors.length} error(s)`, 'red');
    log('   Please fix the issues above before deploying', 'yellow');
    process.exit(1);
  }
}

run().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
