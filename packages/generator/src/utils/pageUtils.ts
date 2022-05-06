import type { RouteConfig } from '@blog/core';
import { matchRoutes } from 'react-router-dom';

function getUrlFromSourcepath(
  sourcepath: string,
  params: Record<string, string | string[]>,
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
        .replace(/\/index$/, ''),
    ) || '/'
  );
}

export interface ManifestDetails {
  css: string[];
  js: string;
}

export type Mainfest = Record<string, ManifestDetails>;

export interface PageAssets {
  getStaticProps: () => Promise<unknown>;
  css: string[];
  js: string;
}

export async function getUrlToPageAssets(
  routes: RouteConfig[],
  manifest: Mainfest,
  rootPath: string,
): Promise<Record<string, PageAssets | undefined>> {
  const entriesLists: [string, PageAssets][][] = await Promise.all(
    routes.map(async (route) => {
      const filepath = (await import('path')).join(rootPath, route.sourcepath);

      const assets = manifest[filepath];

      const paramsList = (await route.getStaticPaths?.()) || [];

      return urlToPageAssetFromStaticProps(route, paramsList, assets);
    }),
  );

  return Object.fromEntries(entriesLists.flat());
}

export async function loadStaticProps(url: string, routes: RouteConfig[]): Promise<unknown> {
  const match = matchRoutes(routes, url)?.[0];

  if (!match) {
    return {};
  }

  const matchedRoute = match.route as RouteConfig;

  const paramsList = (await matchedRoute.getStaticPaths?.()) || [];

  const urlToPageAssets = Object.fromEntries(
    urlToPageAssetFromStaticProps(matchedRoute, paramsList),
  );

  return urlToPageAssets[url]?.getStaticProps() || {};
}

function urlToPageAssetFromStaticProps(
  route: RouteConfig,
  paramsList: Record<string, string | string[]>[],
  assets: ManifestDetails = { css: [], js: '' },
): [string, PageAssets][] {
  if (paramsList.length) {
    return paramsList.map<[string, PageAssets]>((params) => {
      const pathname = getUrlFromSourcepath(route.sourcepath, params);
      const getStaticProps = async () => {
        return route.getStaticProps?.({ params, pathname }) || {};
      };
      return [pathname, { getStaticProps, ...assets }];
    });
  }

  const pathname = getUrlFromSourcepath(route.sourcepath, {});
  const getStaticProps = async () => route.getStaticProps?.({ params: {}, pathname }) || {};
  return [[pathname, { getStaticProps, ...assets }]];
}
