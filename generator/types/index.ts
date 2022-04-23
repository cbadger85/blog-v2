import { AppPageProps } from '@generator/components/App/App';
import { ComponentType, FC, LazyExoticComponent } from 'react';

export interface AppProps {
  Component: FC<AppPageProps>;
  initialProps: unknown;
  preloadedData?: unknown;
}

export interface PageProps<T> {
  staticProps: T;
}

export interface RouteConfig {
  path: string;
  sourcepath: string;
  component: LazyExoticComponent<ComponentType<PageProps<unknown>>>;
  getStaticProps?: () => Promise<unknown>;
}
