import * as Sentry from "@sentry/nextjs";

// Initialize Sentry if SENTRY_DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
    
    // Set profilesSampleRate to 1.0 to profile all transactions
    // We recommend adjusting this value in production
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    // Enable performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
    ],
    
    // Capture environment information
    environment: process.env.NODE_ENV,
    
    // Capture release information
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "development",
    
    // Ignore some common errors
    ignoreErrors: [
      // Network errors that are not actionable
      "Network request failed",
      "Failed to fetch",
      "NetworkError",
      "AbortError",
      // Third-party extension errors
      /^ResizeObserver loop/,
      /^Extension context/,
    ],
    
    // Adjust the beforeSend callback to filter sensitive information
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV !== "true"
      ) {
        return null;
      }
      
      return event;
    },
  });
}

// Export a function to manually capture exceptions with context
export function captureException(error: unknown, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // Fallback to console in development
    console.error("Error captured:", error, context);
  }
}

// Export a function to manually capture messages
export function captureMessage(message: string, context?: Record<string, any>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      extra: context,
    });
  } else {
    // Fallback to console in development
    console.log("Message captured:", message, context);
  }
}

// Export a function to set user information
export function setUser(user: { id: string; email?: string; name?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

// Export a function to clear user information
export function clearUser() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}