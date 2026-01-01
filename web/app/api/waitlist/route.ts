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

    // Send welcome email via Resend
    await resendClient.emails.send({
      from: 'Think by Maslow AI <hello@maslowai.com>',
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

    // Notify admin
    if (process.env.ADMIN_EMAIL) {
      await resendClient.emails.send({
        from: 'Think Waitlist <hello@maslowai.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New waitlist signup #${count}: ${email}`,
        html: `<p><strong>New signup:</strong> ${email} (${name || 'No name'})</p><p>Total: ${count}</p>`,
      });
    }

    return NextResponse.json({ success: true, count }, { status: 200 });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
