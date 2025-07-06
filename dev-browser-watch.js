import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';
import chokidar from 'chokidar';
import deepmerge from 'deepmerge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const browser = process.argv[2];

if (!browser || !['chrome', 'firefox', 'edge'].includes(browser)) {
  console.error('Usage: node dev-browser-watch.js <chrome|firefox|edge>');
  process.exit(1);
}

console.log(`🚀 Starting development watch for ${browser}...`);

// Ensure Bootstrap Icons data exists
const bootstrapIconsPath = path.join(__dirname, 'public', 'bootstrap-icons-data.json');
if (!fs.existsSync(bootstrapIconsPath)) {
  console.log('📦 Generating Bootstrap Icons data...');
  try {
    execSync('node scripts/generate-all-bootstrap-icons.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to generate Bootstrap Icons data');
    process.exit(1);
  }
}

// Paths
const distDir = path.join(__dirname, 'dist-dev');
const buildDir = path.join(__dirname, 'build-dev', browser);
const manifestsDir = path.join(__dirname, 'manifests');

let viteProcess = null;
let isBuilding = false;
let buildTimeout = null;
let lastBuildTime = 0;

// Function to build extension for specific browser with debouncing
function buildExtensionForBrowser() {
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }
  
  buildTimeout = setTimeout(() => {
    const now = Date.now();
    if (now - lastBuildTime < 1000) return; // Не собираем чаще раза в секунду
    
    if (isBuilding) return;
    isBuilding = true;
    lastBuildTime = now;

    try {
      console.log(`📦 Building ${browser} extension...`);
      
      const manifestBasePath = path.join(manifestsDir, 'manifest.base.json');
      const manifestBrowserPath = path.join(manifestsDir, `manifest.${browser}.json`);

      // Clean and create build directory
      if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true });
      }
      fs.mkdirSync(buildDir, { recursive: true });

      // Read and merge manifests
      let manifest = {};

      if (fs.existsSync(manifestBasePath)) {
        const baseManifest = JSON.parse(fs.readFileSync(manifestBasePath, 'utf8'));
        manifest = baseManifest;
      }

      if (manifest.name && !manifest.name.includes('(DEV)')) {
        manifest.name = manifest.name + ' (DEV)';
      }

      if (fs.existsSync(manifestBrowserPath)) {
        const browserManifest = JSON.parse(fs.readFileSync(manifestBrowserPath, 'utf8'));
        manifest = deepmerge(manifest, browserManifest);
      }

      // Write merged manifest
      fs.writeFileSync(
        path.join(buildDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Copy dist files
      function copyRecursive(src, dest) {
        if (!fs.existsSync(src)) return;

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

      copyRecursive(distDir, buildDir);

      // Copy Bootstrap Icons JSON files
      const bootstrapFiles = [
        'bootstrap-icons-data.json',
        'bootstrap-icons-list.json'
      ];

      bootstrapFiles.forEach(file => {
        const srcPath = path.join(__dirname, 'public', file);
        const destPath = path.join(buildDir, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }
      });

      // Copy icon
      const iconPath = path.join(__dirname, 'icons', 'icon.png');
      const iconDestPath = path.join(buildDir, 'icon.png');
      if (fs.existsSync(iconPath)) {
        fs.copyFileSync(iconPath, iconDestPath);
      }

      console.log(`✅ ${browser} extension updated!`);
    } catch (error) {
      console.error(`❌ Error building ${browser} extension:`, error);
    } finally {
      isBuilding = false;
    }
  }, 500); // Задержка 500мс
}

// Start Vite build in watch mode
console.log('👀 Starting Vite build watch mode...');
viteProcess = spawn('npm', ['run', 'build:vite:dev:watch'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Vite build watch error:', error);
});

// Watch for changes in dist-dev directory
const distWatcher = chokidar.watch(distDir, {
  ignored: [/node_modules/, /\.tmp$/, /\.temp$/, /~$/],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50
  }
});

distWatcher.on('change', (filePath) => {
  console.log(`📁 File changed: ${path.relative(__dirname, filePath)}`);
  buildExtensionForBrowser();
});

distWatcher.on('add', (filePath) => {
  console.log(`📁 File added: ${path.relative(__dirname, filePath)}`);
  buildExtensionForBrowser();
});

distWatcher.on('unlink', (filePath) => {
  console.log(`📁 File removed: ${path.relative(__dirname, filePath)}`);
  buildExtensionForBrowser();
});

// Watch for changes in manifest files
const manifestWatcher = chokidar.watch(manifestsDir, {
  persistent: true,
  ignoreInitial: true
});

manifestWatcher.on('change', (filePath) => {
  console.log(`📄 Manifest changed: ${path.relative(__dirname, filePath)}`);
  buildExtensionForBrowser();
});

// Wait for dist-dev to be created, then build
const waitForDistAndBuild = () => {
  if (fs.existsSync(distDir)) {
    console.log('📁 dist-dev directory found, building extension...');
    buildExtensionForBrowser();
  } else {
    console.log('⏳ Waiting for dist-dev directory...');
    setTimeout(waitForDistAndBuild, 1000);
  }
};

// Start checking after a short delay
setTimeout(waitForDistAndBuild, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development mode...');
  if (viteProcess) {
    viteProcess.kill();
  }
  distWatcher.close();
  manifestWatcher.close();
  process.exit(0);
});

console.log(`🎯 Development watch mode started for ${browser}!`);
console.log(`📦 Building to: build-dev/${browser}/`);
console.log('👀 Watching for changes... Press Ctrl+C to stop');