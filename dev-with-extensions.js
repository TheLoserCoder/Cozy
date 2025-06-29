import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import chokidar from 'chokidar';
import deepmerge from 'deepmerge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting development mode with extension auto-rebuild...');

// Paths
const distDir = path.join(__dirname, 'dist-dev');
const manifestsDir = path.join(__dirname, 'manifests');
const browsers = ['chrome', 'firefox', 'edge'];

let viteDevProcess = null;
let viteBuildProcess = null;
let isBuilding = false;

// Function to start Vite dev server
function startViteDevServer() {
  console.log('🌐 Starting Vite dev server...');
  viteDevProcess = spawn('npm', ['run', 'dev:server'], {
    stdio: 'inherit',
    shell: true
  });

  viteDevProcess.on('error', (error) => {
    console.error('❌ Vite dev server error:', error);
  });

  viteDevProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Vite dev server exited with code ${code}`);
    }
  });
}

// Function to start Vite build in watch mode
function startViteBuildWatch() {
  console.log('👀 Starting Vite build watch mode...');
  viteBuildProcess = spawn('npm', ['run', 'build:vite:dev', '--', '--watch'], {
    stdio: 'inherit',
    shell: true
  });

  viteBuildProcess.on('error', (error) => {
    console.error('❌ Vite build watch error:', error);
  });

  viteBuildProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Vite build watch exited with code ${code}`);
    }
  });
}

// Function to build extensions for all browsers
function buildAllExtensions() {
  if (isBuilding) return;
  isBuilding = true;

  try {
    console.log('📦 Building extensions for all browsers...');

    browsers.forEach(browser => {
      buildExtensionForBrowser(browser);
    });

    console.log('✅ All extensions updated!');
  } catch (error) {
    console.error('❌ Error building extensions:', error);
  } finally {
    isBuilding = false;
  }
}

// Function to build extension for specific browser
function buildExtensionForBrowser(browser) {
  const buildDir = path.join(__dirname, 'build-dev', browser);
  const manifestBasePath = path.join(manifestsDir, 'manifest.base.json');
  const manifestBrowserPath = path.join(manifestsDir, `manifest.${browser}.json`);

  // Clean and create build directory
  if (fs.existsSync(buildDir)) {
    fs.rmSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir, { recursive: true });

  // Read and merge manifests
  let manifest = {};

  // Read base manifest
  if (fs.existsSync(manifestBasePath)) {
    const baseManifest = JSON.parse(fs.readFileSync(manifestBasePath, 'utf8'));
    manifest = baseManifest;
  } else {
    console.warn(`⚠️  manifests/manifest.base.json not found for ${browser}`);
    manifest = {
      manifest_version: 3,
      name: "NewTab Extension (DEV)",
      version: "1.0.0-dev",
      description: "A stylish replacement for your new tab (Development Version).",
      chrome_url_overrides: {
        newtab: "index.html"
      },
      permissions: ["storage"],
      host_permissions: ["https://*/*", "http://*/*"]
    };
  }

  // Add DEV suffix to name for development builds
  if (manifest.name && !manifest.name.includes('(DEV)')) {
    manifest.name = manifest.name + ' (DEV)';
  }

  // Read browser-specific manifest
  if (fs.existsSync(manifestBrowserPath)) {
    const browserManifest = JSON.parse(fs.readFileSync(manifestBrowserPath, 'utf8'));
    manifest = deepmerge(manifest, browserManifest);
  }

  // Write merged manifest to build directory
  fs.writeFileSync(
    path.join(buildDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  // Copy dist files to build directory
  function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) {
      return;
    }

    const stats = fs.statSync(src);
    
    if (stats.isDirectory()) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const files = fs.readdirSync(src);
      files.forEach(file => {
        copyRecursive(path.join(src, file), path.join(dest, file));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  // Copy all files from dist-dev to build directory, except manifest files
  copyRecursive(distDir, buildDir);

  // Copy icon from icons directory
  const iconPath = path.join(__dirname, 'icons', 'icon.png');
  const iconDestPath = path.join(buildDir, 'icon.png');
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, iconDestPath);
  }

  // Remove copied manifest files (we only need the merged one)
  const manifestFiles = ['manifest.base.json', 'manifest.chrome.json', 'manifest.firefox.json', 'manifest.edge.json'];
  manifestFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// Watch for changes in dist-dev directory
const distWatcher = chokidar.watch(distDir, {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true
});

distWatcher.on('change', (filePath) => {
  console.log(`📁 File changed: ${path.relative(__dirname, filePath)}`);
  setTimeout(buildAllExtensions, 100); // Small delay to ensure file is fully written
});

distWatcher.on('add', (filePath) => {
  console.log(`📁 File added: ${path.relative(__dirname, filePath)}`);
  setTimeout(buildAllExtensions, 100);
});

distWatcher.on('unlink', (filePath) => {
  console.log(`📁 File removed: ${path.relative(__dirname, filePath)}`);
  setTimeout(buildAllExtensions, 100);
});

// Watch for changes in manifest files
const manifestWatcher = chokidar.watch(manifestsDir, {
  persistent: true,
  ignoreInitial: true
});

manifestWatcher.on('change', (filePath) => {
  console.log(`📄 Manifest changed: ${path.relative(__dirname, filePath)}`);
  buildAllExtensions();
});

// Initial build after a delay
setTimeout(() => {
  buildAllExtensions();
}, 3000); // Wait for Vite to create initial files

// Start both Vite processes
startViteDevServer();
startViteBuildWatch();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development mode...');
  if (viteDevProcess) {
    viteDevProcess.kill();
  }
  if (viteBuildProcess) {
    viteBuildProcess.kill();
  }
  distWatcher.close();
  manifestWatcher.close();
  process.exit(0);
});

console.log('🎯 Development mode started!');
console.log('📱 Vite dev server: http://localhost:3000');
console.log('📦 Extensions auto-building to: build-dev/{browser}/');
console.log('👀 Watching for changes... Press Ctrl+C to stop');
