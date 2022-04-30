import { RouteConfig } from '@generator/types';
import { matchRoutes } from 'react-router-dom';

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

export async function getUrlToGetStaticProps(
  routes: RouteConfig[]
): Promise<Record<string, () => Promise<unknown>>> {
  const entriesLists: [string, () => Promise<unknown>][][] = await Promise.all(
    routes.map(async (route) => {
      const paramsList = (await route.getStaticPaths?.()) || [];

      if (paramsList.length) {
        return paramsList.map<[string, () => Promise<unknown>]>((params) => {
          const pathname = getUrlFromSourcepath(route.sourcepath, params);
          return [
            pathname,
            () => route.getStaticProps?.({ params, pathname }) || Promise.resolve({}),
          ];
        });
      }
      const pathname = getUrlFromSourcepath(route.sourcepath, {});
      return [
        [pathname, () => route.getStaticProps?.({ params: {}, pathname }) || Promise.resolve({})],
      ];
    })
  );

  return Object.fromEntries(entriesLists.flat());
}
