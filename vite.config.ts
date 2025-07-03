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
        { src: 'manifests/manifest.*.json', dest: 'dist' },
        // Copy Bootstrap Icons JSON data
        { src: 'public/bootstrap-icons-data.json', dest: 'dist' },
        { src: 'public/bootstrap-icons-list.json', dest: 'dist' }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
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
