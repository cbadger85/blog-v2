/* eslint-disable no-console */
import { createWriteStream, promises } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import type { PipeableStream } from 'react-dom/server';
import type { HelmetServerState } from 'react-helmet-async';
import { getUrlToPageAssets } from './utils/routeUtils';
import { buildHtmlPage, hydrateHelmetData } from './utils/templateUtils';

const require = createRequire(/* @vite-ignore */ import.meta.url);

export async function generatePages(
  root: string,
  pathToServerFile: string,
  manifest: Record<string, { css: string[]; js: string }>,
) {
  const { routes, preloader, render } = await import(pathToServerFile);

  const urlToGetStaticProps = await getUrlToPageAssets(routes, manifest, root);

  const baseAssets = manifest[require.resolve('@blog/core/client.tsx')];

  const preloadedData = await preloader();

  await Promise.all(
    Object.entries(urlToGetStaticProps).map(async ([url, assets]) => {
      const filepath = path.join(root, '.generator/build', url);
      await createDir(filepath);

      const initialProps = (await assets?.getStaticProps()) || {};

      const htmlFilepath = ['/404', '/505'].includes(url)
        ? `${filepath}.html`
        : path.join(filepath, 'index.html');

      const htmlFile = new Promise<void>((resolve, reject) => {
        const htmlWriteStream = createWriteStream(htmlFilepath, { encoding: 'utf-8' });

        render(
          url,
          { preloadedData, initialProps },
          ({ pipe }: PipeableStream, helmetData: HelmetServerState, err: unknown) => {
            if (err !== null) {
              reject(err);
            }

            const template = buildHtmlPage({
              entryScript: baseAssets.js,
              css: [...(baseAssets?.css || []), ...(assets?.css || [])],
              js: assets?.js,
              preloadedData,
              initialProps,
            });

            const [header, body] = hydrateHelmetData(template, helmetData).split('<!--ssr-->');

            htmlWriteStream.write(header);
            pipe(htmlWriteStream);
            htmlWriteStream.write(body);
            htmlWriteStream.end();
          },
        );

        htmlWriteStream.on('error', (e: Error) => {
          console.error(e);
          reject(e);
        });

        htmlWriteStream.on('finish', () => {
          resolve();
        });
      }).then(() => console.log(path.relative(root, htmlFilepath)));

      if (!initialProps) {
        await htmlFile;
      } else {
        const jsonFilepath = path.join(filepath, 'index.json');

        const jsonFile = promises
          .writeFile(jsonFilepath, JSON.stringify(initialProps || {}), 'utf-8')
          .then(() => console.log(path.relative(root, jsonFilepath)));

        await Promise.all([htmlFile, jsonFile]);
      }
    }),
  );
}

async function createDir(dirname: string) {
  await promises.mkdir(dirname, { recursive: true }).catch((e) => console.error(e));
}
