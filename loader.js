// `loader.js`
// eslint-disable-next-line import/no-unresolved
import { resolve as resolveTs, load, transformSource } from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';

export { load, transformSource };

const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig();
const matchPath = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths);

export function resolve(specifier, context, defaultResolver) {
  const mappedSpecifier = matchPath(specifier);
  if (mappedSpecifier) {
    // eslint-disable-next-line no-param-reassign
    specifier = `${mappedSpecifier}.js`;
  }
  return resolveTs(specifier, context, defaultResolver);
}
