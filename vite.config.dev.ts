import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import copy from 'rollup-plugin-copy'
import path from 'path'

// Development configuration for browser extensions
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        // Copy manifest files from manifests directory
        { src: 'manifests/manifest.*.json', dest: 'dist-dev' }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
    outDir: 'dist-dev',
    // Watch mode is controlled by --watch flag
    rollupOptions: {
      input: {
        // Main entry point for new tab page
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // Ensure consistent naming for WebExtension
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    // Development optimizations
    target: 'es2020',
    minify: false, // Don't minify in dev mode
    sourcemap: true // Generate source maps for debugging
  },
  // Configure for WebExtension development
  server: {
    port: 3000,
    open: false
  },
  // Ensure proper path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
