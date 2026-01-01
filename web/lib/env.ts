import { z } from 'zod';

const envSchema = z.object({
  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Arcjet
  ARCJET_KEY: z.string().optional(),

  // Resend
  RESEND_API_KEY: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),

  // Public
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  // Warn about missing optional but recommended variables
  const env = parsed.data;
  const warnings: string[] = [];

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    warnings.push('Waitlist system will not work without Upstash Redis credentials');
  }

  if (!env.ARCJET_KEY) {
    warnings.push('Email validation will not work without Arcjet API key');
  }

  if (!env.RESEND_API_KEY) {
    warnings.push('Email sending will not work without Resend API key');
  }

  if (!env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    warnings.push('Analytics will not work without Google Analytics measurement ID');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  return env;
}

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
