#!/usr/bin/env node

// Simple build script for Vercel deployment
import { execSync } from 'child_process';
import path from 'path';

try {
  console.log('Building client...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('Client build completed!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}