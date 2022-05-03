import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import ssg from '@blog/generator';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  plugins: [
    react(),
    tsconfigPaths(),
    {
      ...checker({
        overlay: false,
        typescript: true,
        eslint: { lintCommand: 'eslint "./**/*.{ts,tsx}"' },
      }),
      apply: 'serve',
    },
    ssg(),
  ],
  build: {
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    reporters: 'verbose',
    setupFiles: ['./setupTests.ts'],
  },
};

export default config;
