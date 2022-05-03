/* eslint-disable no-console */
import { createRequire } from 'module';
import type { PipeableStream } from 'react-dom/server';
import type { HelmetServerState } from 'react-helmet-async';
import { Plugin } from 'vite';
import { getUrlToPageAssets } from './utils/routeUtils';
import { buildTemplate, hydrateTemplate } from './utils/templateUtils';

const require = createRequire(/* @vite-ignore */ import.meta.url);

export default function ssgDev(): Plugin {
  return {
    name: 'ssg:dev',
    apply: 'serve',

    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl as string;

          try {
            const template = await server.transformIndexHtml(
              url,
              buildTemplate(require.resolve('@blog/core/client.tsx').substring(1)),
            );

            const { render, preloader, routes } = await server.ssrLoadModule(
              require.resolve('@blog/core/server.tsx'),
            );

            const urlToGetStaticProps = await getUrlToPageAssets(routes, {}, process.cwd());

            const initialProps = await urlToGetStaticProps[
              url === '/index.json' ? '/' : url.replace('/index.json', '')
            ]?.getStaticProps?.();

            if (url.endsWith('index.json')) {
              if (initialProps) {
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(initialProps));
                res.end();
                return;
              }

              res.statusCode = 404;
              res.end();
              return;
            }

            const preloadedData = await preloader();

            render(
              url,
              { preloadedData, initialProps },
              ({ pipe }: PipeableStream, helmetData: HelmetServerState, err: unknown) => {
                if (err !== null) {
                  console.error(err);
                }

                const [header, body] = hydrateTemplate(template, helmetData, {
                  preloadedData,
                  initialProps,
                }).split('<!--ssr-->');

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.write(header);
                pipe(res);
                res.write(body);
                res.end();
              },
            );
          } catch (e: unknown) {
            if (e instanceof Error) {
              server.ssrFixStacktrace(e);
            }

            next(e);
          }
        });
      };
    },
  };
}
