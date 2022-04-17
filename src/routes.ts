import { lazy, LazyExoticComponent } from 'react';

export const routes: Record<string, RouteConfig> = {
  '/': {
    component: lazy(() => import('./pages/Home')),
  },
  '/about': {
    component: lazy(() => import('./pages/About')),
  },
};

export interface RouteConfig {
  component: LazyExoticComponent<any>;
  getServerProps?: () => Promise<unknown>;
  routes?: Record<string, RouteConfig>;
}
