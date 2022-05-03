import { lazy } from 'react';
import { AppConfig, RouteConfig, StaticPropsContext } from './types';
import { getPathFromSourcepath } from './utils';

const ROUTES = import.meta.glob('/src/pages/**/([a-z[]*|404).(tsx|ts|jsx|js)');

const routes: RouteConfig[] = Object.entries(ROUTES).map(([sourcepath, module]) => {
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

export default {
  AppComponent: Object.values(import.meta.globEager('/src/app.(tsx|ts|jsx|js)'))[0]?.default,
  ErrorPage:
    Object.values(import.meta.globEager('/src/pages/500.(tsx|ts|jsx|js)'))[0]?.default ||
    (() => null),
  NotFoundPage:
    Object.values(import.meta.globEager('/src/pages/404.(tsx|ts|jsx|js)'))[0]?.default ||
    (() => null),
  routes,
  preloader:
    Object.values(import.meta.globEager('/src/server.(tsx|ts|jsx|js)'))[0]?.preloader ||
    function preloader() {
      return {};
    },
} as AppConfig;
