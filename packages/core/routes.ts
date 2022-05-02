import { lazy } from 'react';
import { RouteConfig, StaticPropsContext } from './types';

export function getPathFromSourcepath(sourcePath: string): string {
  const path = sourcePath
    .replace(/\.(tsx|ts|jsx|js)/, '')
    .replace(/\/src\/pages/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1');

  return path || '/';
}

const ROUTES = import.meta.glob('/src/pages/**/([a-z[]*|404).(tsx|ts|jsx|js)');

export const routes: RouteConfig[] = Object.entries(ROUTES).map(([sourcepath, module]) => {
  return {
    path: getPathFromSourcepath(sourcepath),
    sourcepath,
    loadComponent: module,
    component: lazy(() => module().then((m) => ({ default: m.default }))),
    getStaticPaths: async () => {
      const { getStaticPaths } = await module();

      return getStaticPaths?.();
    },
    getStaticProps: async (ctx: StaticPropsContext) => {
      const { getStaticProps } = await module();

      return getStaticProps?.(ctx);
    },
  };
});
