/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
import { promises as fsPromises } from 'fs';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { Plugin, ResolvedConfig, build } from 'vite';
import { writePage } from './utils/pageUtils';
import { getUrlToGetStaticProps } from './utils/routeUtils';
import { buildTemplate } from './utils/templateUtils';

const rmAsync = fsPromises.rm;

export default function ssgBuild(): Plugin {
  let resolvedConfig: ResolvedConfig;
  let manifest: Record<string, { css: string[]; js: string }>;

  return {
    name: 'ssg:build',
    apply: 'build',
    enforce: 'post',

    config(config) {
      if (config.mode === 'ssr') {
        return config;
      }

      return {
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input: path.resolve(config.root || process.cwd(), 'generator/app/client.tsx'),
          },
        },
      };
    },

    configResolved(config) {
      resolvedConfig = config;
    },

    generateBundle(_options, bundle) {
      if (resolvedConfig.mode === 'ssr') {
        return;
      }

      manifest = Object.fromEntries(
        Object.entries(bundle)
          .filter(([, c]) => c.type === 'chunk')
          .map(([asset, output]) => {
            const chunk = output as OutputChunk;

            const { importedCss } = (chunk as any)?.viteMetadata || {};

            return [
              chunk.facadeModuleId,
              { css: importedCss ? Array.from(importedCss) : [], js: asset },
            ];
          })
      );
    },

    async closeBundle() {
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

      const { preloader, routes } = await import(
        path.resolve(resolvedConfig.root, 'generator/_lib/server.js')
      );

      const preloadedData = await preloader();

      const urlToGetStaticProps = await getUrlToGetStaticProps(routes, manifest, __dirname);

      const baseAssets = manifest[path.resolve(__dirname, 'app/client.tsx')];

      await Promise.all(
        Object.entries(urlToGetStaticProps).map(async ([url, assets]) => {
          const initialProps = (await assets?.getStaticProps()) || {};

          const template = buildTemplate(
            baseAssets.js,
            [...baseAssets.css, ...(assets?.css || [])],
            assets?.js
          );

          await writePage(resolvedConfig.root, url, { preloadedData, initialProps }, template);
        })
      );
    },
  };
}

async function clean(root: string) {
  await rmAsync(path.join(root, 'generator/_lib'), { recursive: true, force: true });
}
