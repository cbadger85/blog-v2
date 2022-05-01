import { matchRoutes } from 'react-router-dom';
import { RouteConfig } from '../types';

export function getPathFromSourcepath(sourcePath: string): string {
  const path = sourcePath
    .replace(/\.(tsx|ts|jsx|js)/, '')
    .replace(/^(.*?)src\/pages/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1');

  return path || '/';
}

// TODO Delete
export function getFilenameFromSourcepath(
  sourcepath: string,
  params: Record<string, string | string[]>,
  ext = ''
): string {
  return (
    Object.entries(params).reduce(
      (path, [key, param]) => {
        if (Array.isArray(param)) {
          return path.replace(`[...${key}]`, param.join('/'));
        }
        return path.replace(`[${key}]`, param);
      },
      sourcepath
        .replace(/\.(tsx|ts|jsx|js)/, '')
        .replace(/^(.*?)src\/pages/, '')
        .replace(/\/index$/, '')
    ) + `/index${ext}`
  );
}

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

// TODO Delete
export async function matchRoute(routes: RouteConfig[], url: string): Promise<RouteConfig | null> {
  const pathnameToRoute = Object.fromEntries(
    (
      await Promise.all(
        routes.map(
          (route) =>
            route
              .getStaticPaths?.()
              .then((paramsList) =>
                paramsList.map<[string, RouteConfig]>((params) => [
                  getUrlFromSourcepath(route.sourcepath, params),
                  route,
                ])
              ) || [[getUrlFromSourcepath(route.sourcepath, {}), route]]
        )
      )
    ).flat()
  );

  return pathnameToRoute[url] || null;
}

// TODO Delete
export async function getStaticPropsFromUrl(
  routes: RouteConfig[],
  url: string
): Promise<unknown | null> {
  const pathnameToRoute = Object.fromEntries(
    (
      await Promise.all(
        routes.map(
          (route) =>
            route
              .getStaticPaths?.()
              .then((paramsList) =>
                paramsList.map<[string, () => Promise<unknown>]>((params) => [
                  getUrlFromSourcepath(route.sourcepath, params),
                  () => route.getStaticProps?.({ params, pathname: url }) || Promise.resolve({}),
                ])
              ) || Promise.resolve([])
        )
      )
    ).flat()
  );

  return pathnameToRoute[url]() || null;
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

export async function getUrlToGetStaticProps(
  routes: RouteConfig[],
  manifest: Mainfest,
  routeRoute: string
): Promise<Record<string, PageAssets | undefined>> {
  const entriesLists: [string, PageAssets][][] = await Promise.all(
    routes.map(async (route) => {
      const paramsList = (await route.getStaticPaths?.()) || [];

      const filepath = (await import('path')).resolve(routeRoute, route.sourcepath);

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
