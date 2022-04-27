import { RouteConfig, StaticPropsContext } from '@generator/types';
import { lazy } from 'react';
import { getPathFromSourcepath } from '@generator/utils';

const ROUTES = import.meta.glob('@app/pages/**/([a-z[]*|404).(tsx|ts|jsx|js)');

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
