import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// Plugin to inject environment variables into service worker at build time
function injectEnvToServiceWorker(): Plugin {
  return {
    name: 'inject-env-to-sw',
    enforce: 'post',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/firebase-messaging-sw.js');

      if (fs.existsSync(swPath)) {
        let content = fs.readFileSync(swPath, 'utf-8');

        // Replace placeholders with environment variables
        content = content
          .replace(/__VITE_FIREBASE_API_KEY__/g, process.env.VITE_FIREBASE_API_KEY || '')
          .replace(/__VITE_FIREBASE_AUTH_DOMAIN__/g, process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
          .replace(/__VITE_FIREBASE_PROJECT_ID__/g, process.env.VITE_FIREBASE_PROJECT_ID || '')
          .replace(
            /__VITE_FIREBASE_STORAGE_BUCKET__/g,
            process.env.VITE_FIREBASE_STORAGE_BUCKET || ''
          )
          .replace(
            /__VITE_FIREBASE_MESSAGING_SENDER_ID__/g,
            process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''
          )
          .replace(/__VITE_FIREBASE_APP_ID__/g, process.env.VITE_FIREBASE_APP_ID || '');

        fs.writeFileSync(swPath, content);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    injectEnvToServiceWorker(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          // React core
          if (/node_modules[\/](react|react-dom)[\/]/.test(id)) return 'vendor-react';

          // Routing & data
          if (id.includes('node_modules/react-router-dom')) return 'vendor-router';
          if (id.includes('@tanstack/react-query-devtools')) return 'vendor-query-devtools';
          if (id.includes('@tanstack/react-query')) return 'vendor-query';

          // Forms/validation
          if (/node_modules[\/](react-hook-form|@hookform\/resolvers|zod)[\/]/.test(id)) {
            return 'vendor-forms';
          }

          // UI helpers
          if (/node_modules[\/](lucide-react|zustand|sonner)[\/]/.test(id)) return 'vendor-ui';

          // Firebase split: messaging separate from core
          if (id.includes('firebase/messaging')) return 'vendor-firebase-messaging';
          if (/node_modules[\/]firebase[\/]/.test(id)) return 'vendor-firebase-core';

          // Sentry
          if (id.includes('@sentry')) return 'vendor-sentry';

          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 400, // Reduced from 600KB to encourage better splitting
  },
});
