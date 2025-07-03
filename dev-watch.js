import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting development with watch mode...');

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

// Start Vite build in watch mode
console.log('👀 Starting Vite build watch mode...');
const viteProcess = spawn('npm', ['run', 'build:vite:dev:watch'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Vite build watch error:', error);
});

viteProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Vite build watch exited with code ${code}`);
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

console.log('🎯 Development watch mode started!');
console.log('📦 Building to: dist-dev/');
console.log('👀 Watching for changes... Press Ctrl+C to stop');