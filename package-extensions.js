import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, 'build');
const browsers = ['chrome', 'firefox', 'edge'];

console.log('📦 Packaging extensions...');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Create packages directory
const packagesDir = path.join(__dirname, 'packages');
if (fs.existsSync(packagesDir)) {
  fs.rmSync(packagesDir, { recursive: true });
}
fs.mkdirSync(packagesDir, { recursive: true });

// Package each browser extension
browsers.forEach(browser => {
  const browserBuildDir = path.join(buildDir, browser);
  
  if (!fs.existsSync(browserBuildDir)) {
    console.warn(`⚠️  Build directory for ${browser} not found, skipping...`);
    return;
  }
  
  console.log(`📦 Packaging ${browser} extension...`);
  
  const zipName = `cozy-${browser}-extension.zip`;
  const zipPath = path.join(packagesDir, zipName);
  
  try {
    // Create zip archive
    process.chdir(browserBuildDir);
    execSync(`zip -r "${zipPath}" .`, { stdio: 'pipe' });
    
    // Get file size
    const stats = fs.statSync(zipPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ ${browser} extension packaged: ${zipName} (${fileSizeInMB} MB)`);
  } catch (error) {
    console.error(`❌ Failed to package ${browser} extension:`, error.message);
  }
});

// Return to original directory
process.chdir(__dirname);

// Create a combined package with all extensions
console.log('📦 Creating combined package...');
try {
  const combinedZipPath = path.join(packagesDir, 'newtab-all-extensions.zip');
  process.chdir(buildDir);
  execSync(`zip -r "${combinedZipPath}" .`, { stdio: 'pipe' });
  
  const stats = fs.statSync(combinedZipPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`✅ Combined package created: newtab-all-extensions.zip (${fileSizeInMB} MB)`);
} catch (error) {
  console.error('❌ Failed to create combined package:', error.message);
}

// Return to original directory
process.chdir(__dirname);

console.log('📊 Packaging summary:');
console.log(`📂 Packages directory: ${packagesDir}`);

// List all created packages
const packages = fs.readdirSync(packagesDir);
packages.forEach(pkg => {
  const pkgPath = path.join(packagesDir, pkg);
  const stats = fs.statSync(pkgPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   📦 ${pkg} (${fileSizeInMB} MB)`);
});

console.log('✅ Packaging completed!');
