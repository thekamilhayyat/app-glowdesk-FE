#!/usr/bin/env node

// Simple wrapper script to start Vite on port 5000
import { spawn } from 'child_process';

// Start Vite with port override
const viteProcess = spawn('npx', ['vite', '--port', '5000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('close', (code) => {
  process.exit(code);
});

viteProcess.on('error', (error) => {
  console.error('Error starting Vite:', error);
  process.exit(1);
});