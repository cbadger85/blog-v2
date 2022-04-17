/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetData } from 'react-helmet';
import { fileURLToPath } from 'url';
import { createServer as createViteServer, build, InlineConfig } from 'vite';

const readFileAsync = fs.promises.readFile;

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

      const preloader = await vite
        .ssrLoadModule(path.resolve(__dirname, 'src/loaders.ts'))
        .then((loaders) => loaders.preload);

      const preloadedData = preloader();

      const template = await readFileAsync(path.resolve(__dirname, 'index.html'), 'utf8').then(
        (file) => vite.transformIndexHtml(url, file)
      );

      const { render } = await vite.ssrLoadModule(path.resolve(__dirname, 'src/server.tsx'));

      render(url, preloadedData, ({ pipe }: PipeableStream, helmetData: HelmetData) => {
        const [header, body] = template
          .replace('<!--ssr-data-->', scriptifyContext(preloadedData))
          .replace('data-ssr-html-attributes', helmetData.htmlAttributes.toString())
          .replace('<!--ssr-title-->', helmetData.title.toString())
          .replace('<!--ssr-meta-->', helmetData.meta.toString())
          .replace('<!--ssr-link-->', helmetData.link.toString())
          .replace('data-ssr-body-attributes', helmetData.bodyAttributes.toString())
          .split('<!--ssr-->');

        res.status(200).set({ 'Content-Type': 'text/html' });
        res.write(header);
        pipe(res);
        res.write(body);
        res.end();
      });
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
  const pages = [
    { route: '/', name: 'index.html' },
    { route: '/about', name: 'about.html' },
  ];

  await build({ mode: 'build' } as InlineConfig);
  await build({ mode: 'ssr' } as InlineConfig);

  const vite = await createViteServer({
    server: {
      middlewareMode: 'ssr',
    },
  });

  try {
    const preloader = await vite
      .ssrLoadModule(path.resolve(__dirname, 'src/loaders.ts'))
      .then((loaders) => loaders.preload);
    vite.close();

    const template = await readFileAsync(
      path.resolve(__dirname, 'build/client/index.html'),
      'utf8'
    );
    fs.promises.rename(
      path.join(__dirname, 'build/server/server.js'),
      path.join(__dirname, 'build/server/server.cjs')
    );

    const { render } = await import(path.resolve(__dirname, 'build/server/server.cjs'));

    pages.forEach((page) => {
      const preloadedData = preloader();

      const writeStream = fs.createWriteStream(path.resolve(__dirname, 'build/client', page.name));

      render(page.route, preloadedData, ({ pipe }: PipeableStream, helmetData: HelmetData) => {
        const [header, body] = template
          .replace('<!--ssr-data-->', scriptifyContext(preloadedData))
          .replace('data-ssr-html-attributes', helmetData.htmlAttributes.toString())
          .replace('<!--ssr-title-->', helmetData.title.toString())
          .replace('<!--ssr-meta-->', helmetData.meta.toString())
          .replace('<!--ssr-link-->', helmetData.link.toString())
          .replace('data-ssr-body-attributes', helmetData.bodyAttributes.toString())
          .split('<!--ssr-->');

        writeStream.write(header, 'utf-8');
        pipe(writeStream);
        writeStream.write(body);
        writeStream.end();
      });

      writeStream.on('error', (e: Error) => {
        console.error(e);
        throw new Error(`Unable to write file ${page.name}`);
      });

      writeStream.on('finish', () => {
        console.log(`generated ${page.name}`);
      });
    });
  } catch (e: unknown) {
    console.error(e);
  }
}

function scriptifyContext(context: unknown): string {
  return `<script>(function() { window.__CONTEXT_DATA__ = ${JSON.stringify(
    context
  )}; })()</script>`;
}

const start = process.argv.includes('generate') ? generate : devServer;

start();
