/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
import { Plugin, ResolvedConfig, build } from 'vite';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { getUrlToGetStaticProps } from './utils/routeUtils';
import { writePage } from './utils/pageUtils';

const rmAsync = fsPromises.rm;

export default function ssgBuild(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: 'ssg:build',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config;
    },

    async buildStart() {
      if (resolvedConfig.mode === 'ssr') {
        return;
      }

      await clean(resolvedConfig.root);

      await build({
        mode: 'ssr',
        logLevel: 'silent',
        build: {
          outDir: 'generator/_lib',
          ssr: 'generator/app/server.tsx',
          rollupOptions: {
            output: {
              format: 'es',
            },
          },
        },
      });
    },

    // writeBundle(_options, bundle) {
    //   if (resolvedConfig.mode === 'ssr') {
    //     return;
    //   }

    //   // delete bundle['index.html'];
    // },

    async generateBundle(_options, bundle) {
      if (resolvedConfig.mode === 'ssr') {
        return;
      }

      const { preloader, routes } = await import(
        path.resolve(resolvedConfig.root, 'generator/_lib/server.js')
      );

      const preloadedData = await preloader();

      const urlToGetStaticProps = await getUrlToGetStaticProps(routes);

      const htmlBundle = bundle['index.html'];

      if (htmlBundle?.type !== 'asset') {
        throw new Error('missing index.html');
      }

      const template = `${htmlBundle.source}`;

      delete bundle['index.html'];

      await Promise.all(
        Object.entries(urlToGetStaticProps).map(async ([url, getStaticProps]) => {
          const initialProps = await getStaticProps();

          await writePage(resolvedConfig.root, url, { preloadedData, initialProps }, template);
        })
      );
    },
  };
}

async function clean(root: string) {
  await rmAsync(path.join(root, 'generator/_lib'), { recursive: true, force: true });
}
