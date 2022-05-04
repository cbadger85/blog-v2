/* eslint-disable no-console */
import { createWriteStream, promises } from 'fs';
import path from 'path';
import { renderToStream, RenderFn } from './streamUtils';
import type { ManifestDetails, PageAssets } from './pageUtils';
import { buildHtmlPage } from './templateUtils';

interface FileDetails {
  url: string;
  baseAssets: ManifestDetails;
  assets: PageAssets | undefined;
  preloadedData: unknown;
}

export async function writePageFiles(
  root: string,
  render: RenderFn,
  { url, baseAssets, assets, preloadedData }: FileDetails,
) {
  const filepath = path.join(root, '.generator/build', url);
  await createDir(filepath);

  const initialProps = (await assets?.getStaticProps()) || {};

  const htmlFilepath = ['/404', '/505'].includes(url)
    ? `${filepath}.html`
    : path.join(filepath, 'index.html');

  const htmlFile = new Promise<void>((resolve, reject) => {
    const htmlWriteStream = createWriteStream(htmlFilepath, { encoding: 'utf-8' });

    const template = buildHtmlPage({
      entryScript: baseAssets.js,
      css: [...(baseAssets?.css || []), ...(assets?.css || [])],
      js: assets?.js,
      preloadedData,
      initialProps,
    });

    renderToStream(htmlWriteStream, render, { url, initialProps, preloadedData, template });

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
}

async function createDir(dirname: string) {
  await promises.mkdir(dirname, { recursive: true }).catch((e) => console.error(e));
}
