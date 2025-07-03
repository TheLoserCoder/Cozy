import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import copy from 'rollup-plugin-copy'
import path from 'path'

// Development configuration for browser extensions
export default defineConfig({
  plugins: [
    react(),
    // Копирование отключено для dev режима
  ],
  build: {
    outDir: 'dist-dev',
    // Watch mode is controlled by --watch flag
    rollupOptions: {
      input: {
        // Main entry point for new tab page
        main: path.resolve(__dirname, 'index.html'),
        // Firefox worker
        worker: path.resolve(__dirname, 'src/worker.ts')
      },
      output: {
        // Ensure consistent naming for WebExtension
        entryFileNames: '[name].js',
        chunkFileNames: (chunkInfo) => {
          // Prevent files starting with underscore
          const name = chunkInfo.name || 'chunk';
          return name.startsWith('_') ? name.substring(1) + '.js' : name + '.js';
        },
        assetFileNames: (assetInfo) => {
          // Prevent assets starting with underscore
          const name = assetInfo.name || 'asset';
          const ext = name.split('.').pop() || 'unknown';
          const baseName = name.replace(/\.[^/.]+$/, '');
          return baseName.startsWith('_') ? baseName.substring(1) + '.' + ext : name;
        },
        manualChunks: {
          // Explicitly name common chunks to avoid underscore prefixes
          vendor: ['react', 'react-dom'],
          utils: ['nanoid', 'tinycolor2']
        }
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
