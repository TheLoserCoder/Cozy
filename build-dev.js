import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import deepmerge from 'deepmerge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const browser = process.argv[2];

if (!browser || !['chrome', 'firefox', 'edge'].includes(browser)) {
  console.error('Usage: node build-dev.js <chrome|firefox|edge>');
  process.exit(1);
}

console.log(`🚀 Building DEV version for ${browser}...`);

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
const manifestBasePath = path.join(__dirname, 'manifests', 'manifest.base.json');
const manifestBrowserPath = path.join(__dirname, 'manifests', `manifest.${browser}.json`);

// Clean and create build directory
if (fs.existsSync(buildDir)) {
  fs.rmSync(buildDir, { recursive: true });
}
fs.mkdirSync(buildDir, { recursive: true });

// Build with Vite (dev config)
console.log('📦 Building with Vite (dev mode)...');
try {
  execSync('npm run build:vite:dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Vite dev build failed');
  process.exit(1);
}

// Read and merge manifests
console.log('📄 Processing manifests...');
let manifest = {};

// Read base manifest
if (fs.existsSync(manifestBasePath)) {
  const baseManifest = JSON.parse(fs.readFileSync(manifestBasePath, 'utf8'));
  manifest = baseManifest;
} else {
  console.warn('⚠️  manifests/manifest.base.json not found, creating minimal manifest');
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
} else {
  console.warn(`⚠️  manifests/manifest.${browser}.json not found, using base manifest only`);
}

// Write merged manifest to build directory
fs.writeFileSync(
  path.join(buildDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

// Copy dist files to build directory
console.log('📁 Copying files...');
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  Source directory ${src} does not exist`);
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

// Copy Bootstrap Icons JSON files for dev
const bootstrapFiles = [
  'bootstrap-icons-data.json',
  'bootstrap-icons-list.json'
];

bootstrapFiles.forEach(file => {
  const srcPath = path.join(__dirname, 'public', file);
  const destPath = path.join(buildDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`🎨 Copied ${file}`);
  }
});

// Copy icon from icons directory
const iconPath = path.join(__dirname, 'icons', 'icon.png');
const iconDestPath = path.join(buildDir, 'icon.png');
if (fs.existsSync(iconPath)) {
  fs.copyFileSync(iconPath, iconDestPath);
  console.log('📱 Icon copied successfully');
} else {
  console.warn('⚠️  Icon not found at icons/icon.png');
}

// Remove copied manifest files (we only need the merged one)
const manifestFiles = ['manifest.base.json', 'manifest.chrome.json', 'manifest.firefox.json', 'manifest.edge.json'];
manifestFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

console.log(`✅ DEV Build completed for ${browser}!`);
console.log(`📂 Output directory: ${buildDir}`);

// Show build summary
const buildSize = fs.readdirSync(buildDir).length;
console.log(`📊 Build contains ${buildSize} files/directories`);
console.log(`🔧 This is a DEVELOPMENT build with source maps and unminified code`);
