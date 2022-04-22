import { RouteConfig } from '@generator/types';
import { lazy } from 'react';

const ROUTES = import.meta.glob('@app/pages/**/([a-z[]*|404).(tsx|ts|jsx|js)');

export const routes: RouteConfig[] = Object.entries(ROUTES).map(([pathname, module]) => {
  const path = pathname
    .replaceAll('../', '')
    .replace('src/pages', '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1')
    .replace(/\.(tsx|ts|jsx|js)/, '');

  return {
    path: path === '/index' ? '/' : path,
    component: lazy(module as never),
    getStaticProps: () => module().then((m) => m.getStaticProps?.()),
  };
});
