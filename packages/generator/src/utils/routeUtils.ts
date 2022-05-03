import { matchRoutes } from 'react-router-dom';
import type { RouteConfig } from '@blog/core';

export function getUrlFromSourcepath(
  sourcepath: string,
  params: Record<string, string | string[]>
): string {
  return (
    Object.entries(params).reduce(
      (url, [key, param]) => {
        if (Array.isArray(param)) {
          return url.replace(`[...${key}]`, param.join('/'));
        }
        return url.replace(`[${key}]`, param);
      },
      sourcepath
        .replace(/\.(tsx|ts|jsx|js)/, '')
        .replace(/^(.*?)src\/pages/, '')
        .replace(/\/index$/, '')
    ) || '/'
  );
}

export function loadModuleFromPathname(
  routes: RouteConfig[],
  pathname: string
): Promise<Record<string, unknown>> {
  const firstMatch = matchRoutes(routes, pathname)?.[0];

  return (firstMatch?.route as RouteConfig)?.loadComponent();
}

export type Mainfest = Record<string, { css: string[]; js: string }>;

export interface PageAssets {
  getStaticProps: () => Promise<unknown>;
  css: string[];
  js: string;
}

export async function getUrlToPageAssets(
  routes: RouteConfig[],
  manifest: Mainfest,
  rootPath: string
): Promise<Record<string, PageAssets | undefined>> {
  const entriesLists: [string, PageAssets][][] = await Promise.all(
    routes.map(async (route) => {
      const paramsList = (await route.getStaticPaths?.()) || [];

      const filepath = (await import('path')).resolve(rootPath, route.sourcepath);

      const assets = manifest[filepath];

      if (paramsList.length) {
        return paramsList.map<[string, PageAssets]>((params) => {
          const pathname = getUrlFromSourcepath(route.sourcepath, params);
          const getStaticProps = () =>
            route.getStaticProps?.({ params, pathname }) || Promise.resolve({});
          return [pathname, { getStaticProps, ...assets }];
        });
      }
      const pathname = getUrlFromSourcepath(route.sourcepath, {});
      const getStaticProps = () =>
        route.getStaticProps?.({ params: {}, pathname }) || Promise.resolve({});
      return [[pathname, { getStaticProps, ...assets }]];
    })
  );

  return Object.fromEntries(entriesLists.flat());
}
