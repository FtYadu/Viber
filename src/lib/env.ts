import { z } from 'zod';

// Core environment variables (required for basic operation)
const coreEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Optional environment variables for features
const optionalEnvSchema = z.object({
  // Email Provider (Resend)
  RESEND_API_KEY: z.string().min(1).optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Cloudflare API
  CLOUDFLARE_API_TOKEN: z.string().min(1).optional(),
  CLOUDFLARE_ZONE_ID: z.string().min(1).optional(),
  
  // Google Drive API
  GOOGLE_DRIVE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_DRIVE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_DRIVE_REFRESH_TOKEN: z.string().min(1).optional(),
  
  // Stripe
  STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  
  // n8n Webhook
  N8N_WEBHOOK_URL: z.string().url().optional(),
  
  // Langflow AI
  LANGFLOW_API_URL: z.string().url().optional(),
  LANGFLOW_API_KEY: z.string().min(1).optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
  
  // Rate Limiting (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

// Combined schema
const envSchema = coreEnvSchema.merge(optionalEnvSchema);

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => err.path.join('.')).join(', ');
      // During build time or when missing optional vars, be more lenient
      if (process.env.SKIP_ENV_VALIDATION === 'true') {
        console.warn(`Skipping environment validation: ${missingVars}`);
        return process.env as z.infer<typeof envSchema>;
      }
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
}

// Export environment variables without strict validation for now
export const env = process.env as z.infer<typeof envSchema>;

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;

// Helper functions for environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Database configuration
export const dbConfig = {
  url: env.DATABASE_URL,
  // Add connection pool settings if needed
  connectionLimit: isProduction ? 20 : 5,
};

// Auth configuration
export const authConfig = {
  url: env.NEXTAUTH_URL,
  secret: env.NEXTAUTH_SECRET,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
};

// Email configuration
export const emailConfig = {
  apiKey: env.RESEND_API_KEY,
  fromEmail: env.FROM_EMAIL,
};

// Cloudflare configuration
export const cloudflareConfig = {
  apiToken: env.CLOUDFLARE_API_TOKEN,
  zoneId: env.CLOUDFLARE_ZONE_ID,
};

// Google Drive configuration
export const googleDriveConfig = {
  clientId: env.GOOGLE_DRIVE_CLIENT_ID,
  clientSecret: env.GOOGLE_DRIVE_CLIENT_SECRET,
  refreshToken: env.GOOGLE_DRIVE_REFRESH_TOKEN,
};

// Stripe configuration
export const stripeConfig = {
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  secretKey: env.STRIPE_SECRET_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
};

// Cloudinary configuration
export const cloudinaryConfig = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
};

// AI services configuration
export const aiConfig = {
  n8nWebhookUrl: env.N8N_WEBHOOK_URL,
  langflow: {
    apiUrl: env.LANGFLOW_API_URL,
    apiKey: env.LANGFLOW_API_KEY,
  },
};

// Monitoring configuration
export const monitoringConfig = {
  sentryDsn: env.SENTRY_DSN,
  vercelAnalyticsId: env.VERCEL_ANALYTICS_ID,
};

// Redis configuration (for rate limiting)
export const redisConfig = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? {
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
} : null;