#!/usr/bin/env node

/**
 * Cross-platform script to kill a process on a specific port
 * Supports macOS, Linux, and Windows
 */

import { execSync } from 'child_process';
import os from 'os';

const port = process.argv[2] || '5005';

// Suppress errors for cleaner output
const execSyncSilent = (command, options = {}) => {
  try {
    return execSync(command, { ...options, stdio: 'pipe' });
  } catch (err) {
    return null;
  }
};

function killPort(port) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows: Use netstat to find PID, then taskkill
    const output = execSyncSilent(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    if (!output) {
      return; // No process on port
    }
    
    const lines = output.trim().split('\n');
    const pids = new Set();
    lines.forEach(line => {
      const match = line.trim().split(/\s+/);
      if (match.length > 0) {
        const pid = match[match.length - 1];
        if (pid && /^\d+$/.test(pid)) {
          pids.add(pid);
        }
      }
    });
    
    pids.forEach(pid => {
      execSyncSilent(`taskkill /PID ${pid} /F`);
    });
  } else {
    // macOS / Linux: Use lsof to find PID, then kill
    const output = execSyncSilent(`lsof -ti :${port}`, { encoding: 'utf-8' });
    if (!output) {
      return; // No process on port
    }
    
    const pids = output.trim().split('\n').filter(pid => pid.length > 0);
    pids.forEach(pid => {
      execSyncSilent(`kill -9 ${pid}`);
    });
  }
}

killPort(port);
