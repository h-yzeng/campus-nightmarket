export async function initializeSentry() {
  // Sentry temporarily disabled due to bundling issues with replay integration
  // TODO: Re-enable with @sentry/browser (lighter package) instead of @sentry/react
  return;

  // Initialize Sentry if DSN is provided (works in both dev and prod)
  // Set VITE_SENTRY_DSN to empty string to disable
  if (import.meta.env.VITE_SENTRY_DSN) {
    try {
      // Dynamically import Sentry to reduce initial bundle size
      const Sentry = await import('@sentry/react');

      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          // Replay integration disabled due to bundling issues
        ],
        // Performance Monitoring
        tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
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
    } catch (error) {
      // Fail silently if Sentry initialization fails
      console.warn('Failed to initialize Sentry:', error);
    }
  }
}
