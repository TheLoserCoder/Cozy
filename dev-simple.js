import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting simple development mode...');

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

// Copy Bootstrap Icons to public for dev server
const publicDir = path.join(__dirname, 'public');
const bootstrapFiles = ['bootstrap-icons-data.json', 'bootstrap-icons-list.json'];

console.log('📋 Bootstrap Icons ready for development');

// Start Vite dev server
console.log('🌐 Starting Vite dev server...');
const viteProcess = spawn('npm', ['run', 'dev:server'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Vite dev server error:', error);
});

viteProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite dev server exited with code ${code}`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development mode...');
  if (viteProcess) {
    viteProcess.kill();
  }
  process.exit(0);
});

console.log('🎯 Simple development mode started!');
console.log('📱 Vite dev server: http://localhost:3000');
console.log('👀 Press Ctrl+C to stop');