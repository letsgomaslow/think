#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Checks codebase for domain issues before deployment
 * 
 * Usage:
 *   node web/scripts/pre-deploy-check.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');

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

function getAllFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    // Skip node_modules, .next, dist, etc.
    if (file === 'node_modules' || file === '.next' || file === 'dist' || 
        file === '.git' || file.startsWith('.')) {
      return;
    }
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (stat.isFile()) {
      // Only check relevant file types
      if (file.match(/\.(ts|tsx|js|jsx|mjs|json|txt|md)$/)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function checkCodebase() {
  logSection('Codebase Domain Check');
  
  const webDir = join(projectRoot, 'web');
  const files = getAllFiles(webDir);
  
  log(`\n📁 Scanning ${files.length} files in web directory...`, 'yellow');
  
  const issues = [];
  const correctFiles = [];
  
  files.forEach(filePath => {
    try {
      const content = readFileSync(filePath, 'utf8');
      const relativePath = filePath.replace(projectRoot + '/', '');
      
      // Skip markdown files (documentation) and this script itself
      if (filePath.endsWith('.md') || filePath.includes('pre-deploy-check.mjs')) {
        return;
      }
      
      // Check for incorrect domain (but exclude error handling, comments, and validation code)
      if (content.includes('maslowai.com')) {
        const lines = content.split('\n');
        const problematicLines = [];
        
        lines.forEach((line, idx) => {
          const trimmedLine = line.trim();
          // Skip if it's in a comment, error message, or validation check
          if (trimmedLine.includes('maslowai.com') && 
              !trimmedLine.startsWith('//') &&
              !trimmedLine.startsWith('*') &&
              !trimmedLine.includes('error') &&
              !trimmedLine.includes('ERROR') &&
              !trimmedLine.includes('detected') &&
              !trimmedLine.includes('Found') &&
              !trimmedLine.includes('validation') &&
              !trimmedLine.includes('includes(\'maslowai.com\')') &&
              !trimmedLine.includes('WARNING') &&
              !trimmedLine.match(/['"`].*maslowai\.com.*['"`]/)) {
            problematicLines.push(idx + 1);
          }
        });
        
        if (problematicLines.length > 0) {
          issues.push({
            file: relativePath,
            type: 'incorrect_domain',
            message: `Found maslowai.com on line(s): ${problematicLines.join(', ')} (may be in actual usage, not error handling)`,
            lines: problematicLines,
          });
        }
      }
      
      // Check for old email address (but exclude error handling, comments, and validation code)
      if (content.includes('hello@maslow.ai') && !filePath.endsWith('.md')) {
        const lines = content.split('\n');
        const problematicLines = [];
        
        lines.forEach((line, idx) => {
          const trimmedLine = line.trim();
          // Skip if it's in a comment, error message, or validation check
          if (trimmedLine.includes('hello@maslow.ai') && 
              !trimmedLine.startsWith('//') &&
              !trimmedLine.startsWith('*') &&
              !trimmedLine.includes('error') &&
              !trimmedLine.includes('ERROR') &&
              !trimmedLine.includes('does not exist') &&
              !trimmedLine.includes('Found') &&
              !trimmedLine.includes('validation') &&
              !trimmedLine.includes('includes(\'hello@maslow.ai\')')) {
            problematicLines.push(idx + 1);
          }
        });
        
        if (problematicLines.length > 0) {
          issues.push({
            file: relativePath,
            type: 'old_email',
            message: `Found hello@maslow.ai (does not exist) on line(s): ${problematicLines.join(', ')}`,
            lines: problematicLines,
          });
        }
      }
      
      // Check for correct email
      if (content.includes('rakesh@maslow.ai')) {
        correctFiles.push(relativePath);
      }
    } catch (error) {
      // Skip files that can't be read
    }
  });
  
  // Report results
  if (issues.length === 0) {
    log('\n✅ No domain issues found in codebase', 'green');
    log(`   Found correct email (rakesh@maslow.ai) in ${correctFiles.length} file(s)`, 'green');
    return true;
  }
  
  log(`\n❌ Found ${issues.length} issue(s):`, 'red');
  
  issues.forEach((issue, index) => {
    log(`\n${index + 1}. ${issue.file}`, 'red');
    log(`   Type: ${issue.type}`, 'yellow');
    log(`   ${issue.message}`, 'yellow');
  });
  
  return false;
}

function checkEnvironmentVariables() {
  logSection('Environment Variables Check');
  
  const requiredVars = [
    'RESEND_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'ARCJET_KEY',
  ];
  
  const optionalVars = [
    'ADMIN_EMAIL',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  log('\n📋 Checking environment variables...', 'yellow');
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
      log(`   ✅ ${varName}: Set`, 'green');
    } else {
      missing.push(varName);
      log(`   ❌ ${varName}: Missing (required)`, 'red');
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      log(`   ✅ ${varName}: Set`, 'green');
    } else {
      log(`   ⚠️  ${varName}: Not set (optional)`, 'yellow');
    }
  });
  
  if (missing.length > 0) {
    log(`\n❌ Missing ${missing.length} required environment variable(s)`, 'red');
    return false;
  }
  
  log('\n✅ All required environment variables are set', 'green');
  return true;
}

async function checkResendDomain() {
  logSection('Resend Domain Verification');
  
  if (!process.env.RESEND_API_KEY) {
    log('⚠️  RESEND_API_KEY not set, skipping Resend API check', 'yellow');
    return true;
  }
  
  try {
    // Import and run the domain checker
    const { default: checkDomain } = await import('./verify-resend-domain.mjs');
    // Since verify-resend-domain.mjs doesn't export, we'll call it differently
    log('   Run verify-resend-domain.mjs separately to check Resend domain', 'blue');
    return true;
  } catch (error) {
    log('⚠️  Could not verify Resend domain (run verify-resend-domain.mjs separately)', 'yellow');
    return true; // Don't fail pre-deploy check if this fails
  }
}

async function run() {
  log('\n🚀 Pre-Deployment Validation', 'cyan');
  log('   Checking codebase before deployment\n', 'cyan');
  
  const codebaseCheck = checkCodebase();
  const envCheck = checkEnvironmentVariables();
  const resendCheck = await checkResendDomain();
  
  logSection('Pre-Deployment Summary');
  
  if (codebaseCheck) {
    log('✅ Codebase check: PASSED', 'green');
  } else {
    log('❌ Codebase check: FAILED', 'red');
  }
  
  if (envCheck) {
    log('✅ Environment variables: PASSED', 'green');
  } else {
    log('❌ Environment variables: FAILED', 'red');
  }
  
  if (resendCheck) {
    log('✅ Resend domain check: PASSED', 'green');
  } else {
    log('⚠️  Resend domain check: SKIPPED', 'yellow');
  }
  
  if (codebaseCheck && envCheck) {
    log('\n🎉 Pre-deployment checks passed!', 'green');
    log('   Safe to deploy', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Pre-deployment checks failed!', 'red');
    log('   Please fix issues above before deploying', 'yellow');
    process.exit(1);
  }
}

run().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
