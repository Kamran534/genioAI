import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize build output
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          swiper: ['swiper'],
          lucide: ['lucide-react']
        }
      }
    },
    // Optimize asset handling
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    // Reduce bundle size
    chunkSizeWarningLimit: 1000
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'swiper', 'lucide-react']
  },
  // Development server optimizations
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  // Preview server
  preview: {
    port: 4173,
    open: true
  }
})
