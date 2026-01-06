import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import arcjet, { validateEmail } from '@arcjet/next';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let redis: Redis | null = null;
let resend: Resend | null = null;
let aj: any = null;

function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
  return redis;
}

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function getArcjet() {
  if (!aj && process.env.ARCJET_KEY) {
    aj = arcjet({
      key: process.env.ARCJET_KEY,
      rules: [
        validateEmail({
          mode: 'LIVE',
          block: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
        }),
      ],
    });
  }
  return aj;
}

/**
 * Validates email "from" address to ensure it uses the correct domain
 * @param fromAddress - The "from" email address (e.g., "Name <email@domain.com>")
 * @returns { isValid: boolean, domain: string, error?: string }
 */
function validateFromAddress(fromAddress: string): { isValid: boolean; domain: string; error?: string } {
  // Extract email from "Name <email@domain.com>" format
  const emailMatch = fromAddress.match(/<([^>]+)>/) || fromAddress.match(/([\w\.-]+@[\w\.-]+\.[\w]+)/);
  const email = emailMatch ? emailMatch[1] : fromAddress;
  
  // Extract domain
  const domainMatch = email.match(/@([\w\.-]+\.[\w]+)/);
  if (!domainMatch) {
    return { isValid: false, domain: '', error: 'Invalid email format' };
  }
  
  const domain = domainMatch[1];
  
  // Check for incorrect domain
  if (domain === 'maslowai.com') {
    return {
      isValid: false,
      domain,
      error: `Invalid domain "${domain}" detected. Code may not be deployed or build cache issue. Expected domain: maslow.ai`,
    };
  }
  
  // Validate correct domain
  if (domain !== 'maslow.ai') {
    return {
      isValid: false,
      domain,
      error: `Domain "${domain}" is not verified. Expected domain: maslow.ai`,
    };
  }
  
  // Validate email address is correct (rakesh@maslow.ai)
  if (!email.includes('rakesh@maslow.ai')) {
    return {
      isValid: false,
      domain,
      error: `Email "${email}" is not the configured sending address. Expected: rakesh@maslow.ai`,
    };
  }
  
  return { isValid: true, domain };
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    const redisClient = getRedis();
    const resendClient = getResend();
    const arcjetClient = getArcjet();

    if (!redisClient || !resendClient || !arcjetClient) {
      return NextResponse.json(
        { error: 'Waitlist service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Arcjet validation
    const decision = await arcjetClient.protect(req, { email });
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: 'Invalid or disposable email address' },
        { status: 400 }
      );
    }

    // Check if already exists
    const exists = await redisClient.sismember('waitlist:emails', email);
    if (exists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Store in Redis
    await redisClient.sadd('waitlist:emails', email);
    if (name) {
      await redisClient.hset(`waitlist:user:${email}`, { name, timestamp: Date.now() });
    }

    // Get total count
    const count = await redisClient.scard('waitlist:emails');

    // Define email "from" addresses
    const welcomeFrom = 'Think by Maslow AI <rakesh@maslow.ai>';
    const adminFrom = 'Think Waitlist <rakesh@maslow.ai>';

    // Validate "from" addresses before sending
    const welcomeValidation = validateFromAddress(welcomeFrom);
    if (!welcomeValidation.isValid) {
      console.error('Email validation error:', welcomeValidation.error);
      return NextResponse.json(
        {
          error: `Email configuration error: ${welcomeValidation.error}. Please check deployment and domain settings.`,
          details: welcomeValidation,
        },
        { status: 500 }
      );
    }

    // Send welcome email via Resend
    try {
      await resendClient.emails.send({
        from: welcomeFrom,
        to: email,
        subject: "You're on the Think waitlist!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a2845; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #6DC4AD;">Welcome to Think</h1>
            <p>${name ? `Hi ${name},` : 'Hi there,'}</p>
            <p>You're on the waitlist for Think by Maslow AI. Get ready to see how AI really thinks.</p>
            <p style="color: #6DC4AD; font-weight: bold;">You're #${count} on the waitlist!</p>
            <p style="color: #cbd5e0; font-size: 14px;">We'll email you when we launch!</p>
          </div>
        `,
      });
    } catch (resendError: any) {
      console.error('Resend API error:', resendError);
      
      // Check for domain-related errors
      const errorMessage = resendError?.message || JSON.stringify(resendError);
      if (errorMessage.includes('maslowai.com')) {
        return NextResponse.json(
          {
            error: 'Domain configuration error: maslowai.com detected. Code may not be deployed correctly. Please verify deployment.',
            details: errorMessage,
          },
          { status: 500 }
        );
      }
      
      if (errorMessage.includes('domain is not verified') || errorMessage.includes('validation_error')) {
        return NextResponse.json(
          {
            error: `Resend domain verification error: ${errorMessage}. Please verify maslow.ai domain is verified in Resend dashboard.`,
            details: errorMessage,
          },
          { status: 500 }
        );
      }
      
      throw resendError; // Re-throw if not a domain error
    }

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      const adminValidation = validateFromAddress(adminFrom);
      if (!adminValidation.isValid) {
        console.error('Admin email validation error:', adminValidation.error);
        // Don't fail the request, just log the error
      } else {
        try {
          await resendClient.emails.send({
            from: adminFrom,
            to: process.env.ADMIN_EMAIL,
            subject: `New waitlist signup #${count}: ${email}`,
            html: `<p><strong>New signup:</strong> ${email} (${name || 'No name'})</p><p>Total: ${count}</p>`,
          });
        } catch (adminError: any) {
          console.error('Admin email send error:', adminError);
          // Don't fail the request if admin email fails
        }
      }
    }

    return NextResponse.json({ success: true, count }, { status: 200 });
  } catch (error: any) {
    console.error('Waitlist error:', error);
    
    // Enhanced error handling for domain-related issues
    const errorMessage = error?.message || JSON.stringify(error);
    const errorString = errorMessage.toLowerCase();
    
    if (errorString.includes('maslowai.com')) {
      return NextResponse.json(
        {
          error: 'Domain configuration error detected. The incorrect domain maslowai.com is being used. Please verify code deployment.',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
    
    if (errorString.includes('domain') && (errorString.includes('not verified') || errorString.includes('validation_error'))) {
      return NextResponse.json(
        {
          error: 'Resend domain verification failed. Please verify maslow.ai domain is verified in Resend dashboard and rakesh@maslow.ai is configured.',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Server error', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint for counter
export async function GET() {
  try {
    const redisClient = getRedis();
    if (!redisClient) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const count = await redisClient.scard('waitlist:emails');
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
