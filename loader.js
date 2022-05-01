// eslint-disable-next-line import/no-unresolved
import { resolve as resolveTs, load, transformSource } from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';
import { lstatSync, readFileSync } from 'fs';
import path from 'path';
import { builtinModules } from 'module';

const pkg = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'package.json'), { encoding: 'utf-8' })
);

export { load, transformSource };

export function resolve(specifier, context, defaultResolver) {
  const { absoluteBaseUrl, paths } = tsConfigPaths.loadConfig(process.cwd());

  const match = tsConfigPaths.createMatchPath(absoluteBaseUrl, paths)(specifier);

  if (match) {
    try {
      const directory = lstatSync(match).isDirectory();
      return resolveTs(`${match}${directory ? '/index.js' : '.js'}`, context, defaultResolver);
    } catch {
      return resolveTs(`${match}.js`, context, defaultResolver);
    }
  }

  const dependencies = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...builtinModules,
    ...['recrawl-sync', 'globrex', 'debug', 'react/jsx-runtime', 'react-dom/server'],
  ];

  const ignoredExtensions = ['.mjs', '.js', '.cjs'];

  if (
    context.parentURL &&
    !dependencies.includes(specifier) &&
    !ignoredExtensions.some((ext) => specifier.endsWith(ext)) &&
    !specifier.includes('vite.config')
  ) {
    const filepath = path.resolve(
      path.dirname(context.parentURL.replace('file://', '')),
      specifier
    );

    try {
      const directory = lstatSync(filepath).isDirectory();
      return resolveTs(`${filepath}${directory ? '/index.js' : '.js'}`, context, defaultResolver);
    } catch {
      return resolveTs(`${filepath}.js`, context, defaultResolver);
    }
  }

  return resolveTs(specifier, context, defaultResolver);
}
