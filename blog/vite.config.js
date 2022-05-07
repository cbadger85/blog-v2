import checker from 'vite-plugin-checker';
import react from '@vitejs/plugin-react';
import ssg from '@blog/generator';
import mdx from '@mdx-js/rollup';

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  plugins: [
    react(),
    {
      ...checker({
        overlay: false,
        typescript: true,
        eslint: { lintCommand: 'eslint "./**/*.{ts,tsx}"' },
      }),
      apply: 'serve',
    },
    mdx({ remarkPlugins: [] }),
    ssg(),
  ],
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
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
