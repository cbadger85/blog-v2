import { ComponentType, createElement, lazy, LazyExoticComponent, ReactNode } from 'react';

export const NOT_FOUND_PAGE = '/404' as const;
export const ERROR_PAGE = '/505' as const;

export const routes: Record<string, RouteConfig> = {
  '/': {
    component: lazy(() => import('./pages/Home')),
    getStaticProps: () => import('./pages/Home').then((module) => module.getStaticProps()),
  },
  '/about': {
    component: lazy(() => import('./pages/About')),
    getStaticProps: () => import('./pages/About').then((module) => module.getStaticProps()),
  },
  [NOT_FOUND_PAGE]: {
    element: createElement('div', {}, 'Oops'),
  },
};

export interface PageProps<T> {
  staticProps: T;
}

export interface PageConfig<T> {
  component: LazyExoticComponent<ComponentType<PageProps<T>>>;
  errorFallback?: ReactNode;
  loadingFallback?: ReactNode;
  getStaticProps?: () => Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteConfig<T = any> = PageConfig<T> | { element: ReactNode };
