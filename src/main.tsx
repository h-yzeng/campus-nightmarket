import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorBoundary from './components/layout/ErrorBoundary.tsx';
import './styles/index.css';
import { logger } from './utils/logger';
import { initializeSentry } from './config/sentry.tsx';

// Expose Vite env to non-Vite contexts (e.g., Jest) via globals
const viteEnv = import.meta.env;
(globalThis as Record<string, unknown>).__VITE_VERIFICATION_REDIRECT_URL__ =
  viteEnv.VITE_VERIFICATION_REDIRECT_URL;
(globalThis as Record<string, unknown>).__VITE_FIREBASE_AUTH_DOMAIN__ =
  viteEnv.VITE_FIREBASE_AUTH_DOMAIN;

// Initialize Sentry for error tracking (async, non-blocking)
initializeSentry().catch((error) => {
  console.warn('Sentry initialization failed:', error);
});

document.documentElement.classList.add('dark');

// Configure React Query with optimized caching strategy
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default staleTime: data older than this is considered stale
      staleTime: 2 * 60 * 1000, // 2 minutes for most queries

      // gcTime: how long unused data stays in cache (formerly cacheTime)
      gcTime: 10 * 60 * 1000, // 10 minutes

      // Don't refetch on window focus by default (can override per query)
      refetchOnWindowFocus: false,

      // Retry failed queries once
      retry: 1,

      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Refetch on reconnect if data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Shorter retry delay for mutations (user action)
      retryDelay: 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      logger.info('Service Worker registered:', registration);
    })
    .catch((error) => {
      logger.error('Service Worker registration failed:', error);
    });
}
