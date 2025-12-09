export async function initializeSentry() {
  // Initialize Sentry if DSN is provided (works in both dev and prod)
  // Set VITE_SENTRY_DSN to empty string to disable
  if (import.meta.env.VITE_SENTRY_DSN) {
    // Dynamically import Sentry to reduce initial bundle size
    const Sentry = await import('@sentry/react');

    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      // Before send hook to filter sensitive data
      beforeSend(event) {
        // Filter out personally identifiable information
        if (event.request) {
          delete event.request.cookies;
        }
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        return event;
      },
    });
  }
}
