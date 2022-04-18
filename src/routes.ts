import { ComponentType, lazy, LazyExoticComponent } from 'react';

export const routes: Record<string, RouteConfig> = {
  '/': {
    component: lazy(() => import('./pages/Home')),
    getStaticProps: () => import('./pages/Home').then((module) => module.getStaticProps()),
  },
  '/about': {
    component: lazy(() => import('./pages/About')),
    getStaticProps: () => import('./pages/About').then((module) => module.getStaticProps()),
  },
};

export interface PageProps<T> {
  staticProps: T;
}

export interface RouteConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: LazyExoticComponent<ComponentType<PageProps<any>>>;
  getStaticProps?: () => Promise<unknown>;
}
