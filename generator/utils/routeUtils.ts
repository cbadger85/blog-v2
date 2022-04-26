import { RouteConfig } from '@generator/types';

export function getPathFromSourcepath(sourcePath: string): string {
  const path = sourcePath
    .replace(/\.(tsx|ts|jsx|js)/, '')
    .replace(/^(.*?)src\/pages/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1');

  return path || '/';
}

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
