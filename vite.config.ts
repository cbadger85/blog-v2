/// <reference types="vitest" />

import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tsconfigPaths(),
      checker({
        overlay: false,
        typescript: true,
        eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' },
      }),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: mode === 'ssr' ? 'build/server' : 'build/client',
      ssr: 'src/server.tsx',
      minify: mode !== 'ssr',
      // lib:
      //   mode === 'ssr'
      //     ? {
      //         entry: 'src/server.tsx',
      //         fileName: 'server',
      //         formats: ['es'],
      //       }
      //     : undefined,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      reporters: 'verbose',
      setupFiles: ['./setupTests.ts'],
    },
  };
});
