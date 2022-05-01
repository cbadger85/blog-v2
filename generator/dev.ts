/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
import { promises as fsPromises } from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetServerState } from 'react-helmet-async';
import { Plugin, ResolvedConfig } from 'vite';
import { getUrlToGetStaticProps } from './utils/routeUtils';
import { hydrateTemplate } from './utils/templateUtils';

const { readFile: readFileAsync } = fsPromises;

export default function dev(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: 'vite-plugin-ssg:dev',
    apply: 'serve',
    configResolved(config) {
      resolvedConfig = config;
    },
    configureServer(server) {
      const { root } = resolvedConfig;

      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl as string;

          try {
            const template = await readFileAsync(path.resolve(root, 'index.html'), 'utf8').then(
              (file) => server.transformIndexHtml(url, file)
            );

            const { render, preloader, routes } = await server.ssrLoadModule(
              path.resolve(root, 'generator/app/server.tsx')
            );

            const urlToGetStaticProps = await getUrlToGetStaticProps(routes);

            const initialProps = await urlToGetStaticProps[
              url === '/index.json' ? '/' : url.replace('/index.json', '')
            ]?.();

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
              }
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
