import { AppPageProps } from '@generator/components/App/App';
import { ComponentType, FC, LazyExoticComponent } from 'react';

export interface AppProps {
  Component: FC<AppPageProps>;
  initialProps: unknown;
  preloadedData?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PagePropsFromStaticProps<T extends (...args: any[]) => any> = ReturnType<T>;

export interface RouteConfig {
  path: string;
  sourcepath: string;
  component: LazyExoticComponent<ComponentType<unknown>>;
  getStaticProps?: (ctx: StaticPropsContext) => Promise<unknown>;
  getStaticPaths?: () => Promise<Record<string, string | string[]>[]>;
}

export interface StaticPropsContext<
  T extends Record<string, string | string[]> = Record<string, string | string[]>
> {
  params: T;
  pathname: string;
}
