/* eslint-disable no-console */
import { createRequire } from 'module';
import { Plugin } from 'vite';
import { renderToStream } from './utils/streamUtils';
import { getUrlToPageAssets } from './utils/pageUtils';
import { buildHtmlPage } from './utils/templateUtils';

const require = createRequire(/* @vite-ignore */ import.meta.url);

export default function ssgDev(): Plugin {
  return {
    name: 'ssg:dev',
    apply: 'serve',

    configureServer(server) {
      return async () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl as string;

          try {
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

            const template = await server.transformIndexHtml(
              url,
              buildHtmlPage({
                preloadedData,
                initialProps,
                entryScript: require.resolve('@blog/core/client.tsx').substring(1),
                css: [],
              }),
            );

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            renderToStream(res, render, { url, initialProps, preloadedData, template });
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
