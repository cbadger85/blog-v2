import { RouteConfig } from '@generator/types';
import { lazy } from 'react';
import { getPathFromSourcepath } from '@generator/utils';

const ROUTES = import.meta.glob('@app/pages/**/([a-z[]*|404).(tsx|ts|jsx|js)');

export const routes: RouteConfig[] = Object.entries(ROUTES).map(([pathname, module]) => {
  return {
    path: getPathFromSourcepath(pathname),
    sourcepath: pathname,
    component: lazy(module as never),
    getStaticPaths: async () => {
      const { getStaticPaths } = await module();

      return getStaticPaths?.();
    },
    getStaticProps: async (ctx: { params: Record<string, string | string[]> }) => {
      const { getStaticProps } = await module();

      return getStaticProps?.(ctx);
    },
  };
});
