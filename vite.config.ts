import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import copy from 'rollup-plugin-copy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        // Copy manifest files from manifests directory
        { src: 'manifests/manifest.*.json', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
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
    // Optimize for WebExtension environment
    target: 'es2020',
    minify: 'esbuild'
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
