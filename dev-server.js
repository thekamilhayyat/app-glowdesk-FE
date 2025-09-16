#!/usr/bin/env node

// Development server script that uses custom Vite config on port 5000
import { spawn } from 'child_process';

const viteProcess = spawn('npx', ['vite', '--config', 'vite.dev.config.ts', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('close', (code) => {
  process.exit(code);
});

viteProcess.on('error', (error) => {
  console.error('Error starting development server:', error);
  process.exit(1);
});