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
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase-core': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage',
          ],
          // Firebase Messaging is lazy-loaded separately since it's only needed after login
          'vendor-firebase-messaging': ['firebase/messaging'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': ['lucide-react', 'zustand'],

          // Page chunks - buyer pages
          'pages-buyer': [
            './src/pages/buyer/Browse.tsx',
            './src/pages/buyer/Cart.tsx',
            './src/pages/buyer/Checkout.tsx',
            './src/pages/buyer/UserOrders.tsx',
            './src/pages/buyer/OrderDetails.tsx',
            './src/pages/buyer/ViewProfileWrapper.tsx',
          ],

          // Page chunks - seller pages
          'pages-seller': [
            './src/pages/seller/SellerDashboard.tsx',
            './src/pages/seller/CreateListing.tsx',
            './src/pages/seller/EditListing.tsx',
            './src/pages/seller/SellerListings.tsx',
            './src/pages/seller/SellerOrders.tsx',
          ],

          // Page chunks - auth pages
          'pages-auth': [
            './src/pages/Home.tsx',
            './src/pages/Login.tsx',
            './src/pages/Signup.tsx',
            './src/pages/UserProfile.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit to reduce warnings
  },
});
