/**
 * @type {import('vite').UserConfig}
 */
const config = {
  test: {
    globals: true,
    reporters: 'verbose',
    setupFiles: ['./setupTests.ts'],
  },
};

export default config;
