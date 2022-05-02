export { render } from './src/server';

export const preloader =
  Object.values(import.meta.globEager('/src/server.(tsx|ts|jsx|js)'))[0]?.preloader ||
  function preloader() {
    return {};
  };

export { routes } from './src/routes';
