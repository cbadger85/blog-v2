/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import serveStatic from 'serve-static';

const readFileAsync = fs.promises.readFile;

dotenv.config();

const port = process.env.SERVER_PORT;
const isProd = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function devServer() {
  const app = express();

  const vite = await createViteServer({
    server: {
      middlewareMode: 'ssr',
    },
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const template = await readFileAsync(path.resolve(__dirname, 'index.html'), 'utf8').then(
        (file) => vite.transformIndexHtml(url, file)
      );

      const { render } = await vite.ssrLoadModule(path.resolve(__dirname, 'src/server.tsx'));

      const page = await render(url).then((html: string) => template.replace('<!--ssr-->', html));

      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e: unknown) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Development server started on port: ${port}`);
  });
}

async function prodServer() {
  const app = express();

  app.use(serveStatic(path.resolve(__dirname, 'build/client'), { index: false }));

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      const { render } = await import(path.resolve(__dirname, 'build/server/server.js'));
      const template = await readFileAsync(
        path.resolve(__dirname, 'build/client/index.html'),
        'utf8'
      );

      const page = await render(url).then((html: string) => template.replace('<!--ssr-->', html));

      res.status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e: unknown) {
      next(e);
    }
  });

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Production server started on port: ${port}`);
  });
}

const createServer = isProd ? prodServer : devServer;

createServer();
