/* eslint-disable no-console */
import { getUrlToGetStaticProps } from '@generator/utils';
import dotenv from 'dotenv';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { build } from 'vite';
import { writePage } from './utils/pageUtils';

const { readFile: readFileAsync, rm: rmAsync } = fsPromises;

dotenv.config();

const root = process.cwd();

async function generate() {
  try {
    await clean();

    await build({ mode: 'build' });

    const template = await readFileAsync(path.resolve(root, 'build/index.html'), 'utf8');

    await build({ mode: 'ssr' });

    const { preloader, routes } = await import(path.resolve(root, 'generator/_lib/server.js'));

    const preloadedData = await preloader();

    const urlToGetStaticProps = await getUrlToGetStaticProps(routes);

    await Promise.all(
      Object.entries(urlToGetStaticProps).map(async ([url, getStaticProps]) => {
        const initialProps = await getStaticProps();

        await writePage(root, url, { preloadedData, initialProps }, template);
      })
    );
  } catch (e: unknown) {
    console.error(e);
  }
}

async function clean() {
  await rmAsync(path.join(root, 'generator/_lib'), { recursive: true, force: true });
}

generate();
