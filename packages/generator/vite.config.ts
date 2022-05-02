/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import pkg from './package.json';

const EXTERNALS = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.devDependencies),
  ...Object.keys(pkg.peerDependencies),
];

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    lib: {
      fileName: 'index',
      entry: './src/index.ts',
      formats: ['es'],
    },
    rollupOptions: {
      external: (source) => EXTERNALS.includes(source),
    },
  },
  test: {
    globals: true,
    reporters: 'verbose',
    setupFiles: ['./setupTests.ts'],
  },
});
