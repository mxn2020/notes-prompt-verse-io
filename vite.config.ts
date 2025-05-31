import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true, // Allow external connections
    strictPort: true, // Exit if port is already in use
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Ensure compatibility with Netlify
  define: {
    global: 'globalThis',
  },
  // Add assets configuration to handle HTML files properly
  assetsInclude: ['**/*.html'],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
})