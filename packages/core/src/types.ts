import { ComponentType, FC, LazyExoticComponent } from 'react';
import { AppPageProps } from './components/App';

export interface AppProps {
  Component: FC<AppPageProps>;
  initialProps: unknown;
  preloadedData?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FromStaticProps<T extends (...args: any[]) => any> = Awaited<ReturnType<T>>;

export interface RouteConfig {
  path: string;
  sourcepath: string;
  component: LazyExoticComponent<ComponentType<unknown>>;
  loadComponent: () => Promise<Record<string, unknown>>;
  getStaticProps?: (ctx: StaticPropsContext) => Promise<unknown>;
  getStaticPaths?: () => Promise<Record<string, string | string[]>[]>;
}

export interface StaticPropsContext<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> {
  params: T;
  pathname: string;
}

export interface AppConfig {
  AppComponent?: FC<AppProps>;
  ErrorPage: FC;
  NotFoundPage: FC;
  routes: RouteConfig[];
  preloader: () => Promise<unknown>;
}
