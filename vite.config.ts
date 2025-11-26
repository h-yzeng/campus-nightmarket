import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/messaging'],
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
})

