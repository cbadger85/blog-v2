/* eslint-disable no-console */
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetServerState } from 'react-helmet-async';
import { matchRoutes } from 'react-router-dom';
import { createServer as createViteServer, build } from 'vite';
import { RouteConfig } from './types';

const readFileAsync = fs.promises.readFile;
const writeFileAsync = fs.promises.writeFile;

dotenv.config();

const root = process.cwd();

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

      const template = await readFileAsync(path.resolve(root, 'index.html'), 'utf8').then((file) =>
        vite.transformIndexHtml(url, file)
      );

      const { render, preloader, routes } = await vite.ssrLoadModule(
        path.resolve(root, 'generator/server.tsx')
      );

      const routesMap: Record<string, RouteConfig> = Object.fromEntries(
        routes.map((route: RouteConfig) => [route.path, route])
      );

      if (url.endsWith('.json')) {
        // TODO

        console.log(matchRoutes(routes, url.replace('/index.json', '')));

        const { route } = matchRoutes(routes, url.replace('/index.json', ''))?.[0] || {};

        const jsonData = await (route as RouteConfig | undefined)?.getStaticProps?.();

        // const pagePath = url === '/index.json' ? '/' : url.substring(0, url.length - 5);
        // const jsonData = await routesMap[pagePath]?.getStaticProps?.();

        if (jsonData) {
          res.send(jsonData);
          return;
        }

        res.sendStatus(404);
        return;
      }

      const preloadedData = await preloader();
      const initialProps = await routesMap[url]?.getStaticProps?.();

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
    await clean();

    await build({ mode: 'build' });

    const template = await readFileAsync(path.resolve(root, 'build/index.html'), 'utf8');

    await build({ mode: 'ssr' });

    const { preloader, routes } = await import(path.resolve(root, 'generator/_lib/server.js'));

    const fileGeneratorPromises = (routes as RouteConfig[]).flatMap((route) => {
      const htmlFile = (preloader() as Promise<unknown>)
        .then((preloadedData) =>
          route.getStaticProps?.().then((initialProps) => ({ initialProps, preloadedData }))
        )
        .then((pageData) =>
          writeHtmlFile(
            {
              filepath: getFilenameFromSourcepath(route.sourcepath, {}, '.html'),
              path: route.path,
            },
            pageData || ({} as PageData),
            template
          )
        )
        .then((htmlFilePath) => console.log(path.relative(root, htmlFilePath)));

      const jsonFilePath = path.resolve(
        root,
        'build',
        getFilenameFromSourcepath(route.sourcepath, {}, '.json')
      );
      const jsonFile = createDir(jsonFilePath)
        .then(() => route.getStaticProps?.())
        .then((props) => {
          if (props) {
            return writeFileAsync(jsonFilePath, JSON.stringify(props)).then(() => true);
          }

          return Promise.resolve(false);
        })
        .then((isWritten) => isWritten && console.log(path.relative(root, jsonFilePath)));

      return [htmlFile, jsonFile];
    });

    await Promise.all(fileGeneratorPromises);
  } catch (e: unknown) {
    console.error(e);
  }
}

async function clean() {
  await fs.promises.rm(path.join(root, 'generator/_lib'), { recursive: true, force: true });
}

interface PageData {
  preloadedData: unknown;
  initialProps: unknown;
}

interface PageInfo {
  path: string;
  filepath: string;
}

async function writeHtmlFile(
  pageInfo: PageInfo,
  { preloadedData, initialProps }: PageData,
  template: string
): Promise<string> {
  const htmlFilePath = path.resolve(root, 'build', pageInfo.filepath);
  await createDir(htmlFilePath);

  const { render } = await import(path.resolve(root, 'generator/_lib/server.js'));

  return new Promise((resolve, reject) => {
    const htmlWriteStream = fs.createWriteStream(htmlFilePath);

    render(
      pageInfo.path,
      { preloadedData, initialProps },
      ({ pipe }: PipeableStream, helmetData: HelmetServerState, err: unknown) => {
        if (err !== null) {
          reject(err);
        }
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
      reject(e);
    });

    htmlWriteStream.on('finish', () => {
      resolve(htmlFilePath);
    });
  });
}

async function createDir(filepath: string) {
  const dirname = path.dirname(filepath);

  await fs.promises.mkdir(dirname, { recursive: true }).catch((e) => console.error(e));
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
  const contextScript =
    `<script>(function() { ` +
    `window.__PRELOADED_DATA__ = ${JSON.stringify(preloadedData)}; ` +
    `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)} ` +
    `})()</script>`;
  return template
    .replace('<!--ssr-data-->', contextScript)
    .replace('data-ssr-html-attributes', helmetData.htmlAttributes.toString())
    .replace('<!--ssr-title-->', helmetData.title.toString())
    .replace('<!--ssr-meta-->', helmetData.meta.toString())
    .replace('<!--ssr-link-->', helmetData.link.toString())
    .replace('data-ssr-body-attributes', helmetData.bodyAttributes.toString());
}

function getFilenameFromSourcepath(
  sourcepath: string,
  params: Record<string, string | string[]>,
  ext = ''
): string {
  const relativePath =
    Object.entries(params).reduce(
      (pathname, [key, param]) => {
        if (Array.isArray(param)) {
          return pathname.replace(`[...${key}]`, param.join('/'));
        }
        return pathname.replace(`[${key}]`, param);
      },
      sourcepath
        .replace(/\.(tsx|ts|jsx|js)/, '')
        .replace(/^(.*?)src\/pages/, '')
        .replace(/\/index$/, '')
    ) + `/index${ext}`;

  console.log(path.join(root, 'build', relativePath));

  return path.join(root, 'build', relativePath);
}

const start = process.argv.includes('generate') ? generate : devServer;

start();
