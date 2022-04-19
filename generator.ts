/* eslint-disable no-console */
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetServerState } from 'react-helmet-async';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, build } from 'vite';

const readFileAsync = fs.promises.readFile;
const writeFileAsync = fs.promises.writeFile;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function devServer() {
  const port = process.env.SERVER_PORT || 3000;
  const open = process.env.SERVER_OPEN_BROWSER === 'true';

  const app = express();

  const vite = await createViteServer({
    server: {
      middlewareMode: 'ssr',
      open,
    },
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      const template = await readFileAsync(path.resolve(__dirname, 'index.html'), 'utf8').then(
        (file) => vite.transformIndexHtml(url, file)
      );

      const { render, preloader, routes } = await vite.ssrLoadModule(
        path.resolve(__dirname, 'src/server.tsx')
      );

      if (url.endsWith('.json')) {
        const jsonData = await getJsonDataLoaders(routes)[url]?.();

        if (jsonData) {
          res.send(jsonData);
          return;
        }

        res.send({});
        return;
      }

      const preloadedData = await preloader();
      const initialProps = (await routes[url]?.getStaticProps()) || {};

      render(
        url,
        preloadedData,
        initialProps,
        ({ pipe }: PipeableStream, helmetData: HelmetServerState) => {
          const [header, body] = hydrateTemplate(template, helmetData, {
            preloadedData,
            initialProps,
          }).split('<!--ssr-->');

          res.status(200).set({ 'Content-Type': 'text/html' });
          res.write(header);
          pipe(res);
          res.write(body);
          res.end();
        }
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(port, () => {
    console.log(`Development server started on: http://localhost:${port}`);
  });
}

async function generate() {
  try {
    await build({ mode: 'ssr' });

    const { render, preloader, routes } = await import(
      path.resolve(__dirname, 'build/server/server.js')
    );

    await build({ mode: 'build' });
    const template = await readFileAsync(
      path.resolve(__dirname, 'build/client/index.html'),
      'utf8'
    );

    const pages = Object.entries<{ getStaticProps?: () => Promise<unknown> }>(routes).map(
      ([route, { getStaticProps }]) => {
        const routeSegments = route.split('/');
        const name = `${routeSegments[routeSegments.length - 1] || 'index'}.html`;
        const jsonPath = `${route === '/' ? '/home' : route}.json`.substring(1);

        return {
          route,
          json: { path: jsonPath, getStaticProps },
          name,
        };
      }
    );

    pages.forEach(async (page) => {
      const preloadedData = await preloader();
      const initialProps = await routes[page.route].getStaticProps();

      const htmlWriteStream = fs.createWriteStream(
        path.resolve(__dirname, 'build/client', page.name)
      );

      writeFileAsync(
        path.resolve(__dirname, 'build/client', page.json.path),
        JSON.stringify((await page.json.getStaticProps?.()) || {})
      );

      render(
        page.route,
        preloadedData,
        initialProps,
        ({ pipe }: PipeableStream, helmetData: HelmetServerState) => {
          const [header, body] = hydrateTemplate(template, helmetData, {
            preloadedData,
            initialProps,
          }).split('<!--ssr-->');

          htmlWriteStream.write(header, 'utf-8');
          pipe(htmlWriteStream);
          htmlWriteStream.write(body);
          htmlWriteStream.end();
        }
      );

      htmlWriteStream.on('error', (e: Error) => {
        console.error(e);
        throw new Error(`Unable to write file ${page.name}`);
      });

      htmlWriteStream.on('finish', () => {
        // TODO
      });
    });
  } catch (e: unknown) {
    console.error(e);
  }
}

interface TemplateData {
  preloadedData: unknown;
  initialProps: unknown;
}

function hydrateTemplate(
  template: string,
  helmetData: HelmetServerState,
  { preloadedData, initialProps }: TemplateData
): string {
  const contextScript = `<script>(function() { window.__PRELOADED_DATA__ = ${JSON.stringify(
    preloadedData
  )}; window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)} })()</script>`;
  return template
    .replace('<!--ssr-data-->', contextScript)
    .replace('data-ssr-html-attributes', helmetData.htmlAttributes.toString())
    .replace('<!--ssr-title-->', helmetData.title.toString())
    .replace('<!--ssr-meta-->', helmetData.meta.toString())
    .replace('<!--ssr-link-->', helmetData.link.toString())
    .replace('data-ssr-body-attributes', helmetData.bodyAttributes.toString());
}

type RouteConfig = Record<string, { getStaticProps?: () => Promise<unknown> }>;

function getJsonDataLoaders(route: RouteConfig) {
  return Object.fromEntries(
    Object.entries(route).map(([url, { getStaticProps }]) => [
      `${url === '/' ? '/home' : url}.json`,
      getStaticProps,
    ])
  );
}

const start = process.argv.includes('generate') ? generate : devServer;

start();
