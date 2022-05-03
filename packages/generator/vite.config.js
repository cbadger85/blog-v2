import { builtinModules } from 'module';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const EXTERNALS = [
  ...builtinModules,
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.devDependencies),
  ...Object.keys(pkg.peerDependencies),
];

/**
 * @type {import('vitest').UserConfig}
 */
const config = {
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
};

export default config;
