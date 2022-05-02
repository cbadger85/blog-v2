import { promises as fsPromises } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { build, Plugin, ResolvedConfig } from 'vite';
import { writePage } from './utils/pageUtils';
import { getUrlToGetStaticProps } from './utils/routeUtils';
import { buildTemplate } from './utils/templateUtils';

const SSG_MODE = 'ssg';

const require = createRequire(/* @vite-ignore */ import.meta.url);

const rmAsync = fsPromises.rm;

export default function ssgBuild(): Plugin {
  let resolvedConfig: ResolvedConfig;
  let manifest: Record<string, { css: string[]; js: string }>;

  return {
    name: 'ssg:build',
    apply: 'build',
    enforce: 'post',

    config(config) {
      if (config.mode === SSG_MODE) {
        return config;
      }

      return {
        ...config,
        build: {
          ...config.build,
          rollupOptions: {
            ...config.build?.rollupOptions,
            input: require.resolve('@blog/core/client.tsx'),
          },
        },
      };
    },

    configResolved(config) {
      resolvedConfig = config;
    },

    generateBundle(_options, bundle) {
      if (resolvedConfig.mode === SSG_MODE) {
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
      if (resolvedConfig.mode === SSG_MODE) {
        return;
      }

      const buildDir = path.join(path.dirname(require.resolve('@blog/generator')), 'dist');
      const serverFilename = '.server';
      const serverFilepath = path.resolve(buildDir, serverFilename + '.js');

      await clean(buildDir);

      process.env.NODE_ENV = 'production';

      await build({
        mode: SSG_MODE,
        logLevel: 'silent',
        build: {
          outDir: buildDir,
          ssr: require.resolve('@blog/core/server.tsx'),
          emptyOutDir: false,
          rollupOptions: {
            output: {
              format: 'es',
              name: serverFilename,
            },
          },
        },
      });

      const { preloader, routes } = await import(serverFilepath);

      const preloadedData = await preloader();

      const urlToGetStaticProps = await getUrlToGetStaticProps(
        routes,
        manifest,
        resolvedConfig.root
      );

      const baseAssets = manifest[require.resolve('@blog/core/client.tsx')];

      await Promise.all(
        Object.entries(urlToGetStaticProps).map(async ([url, assets]) => {
          const initialProps = (await assets?.getStaticProps()) || {};

          const template = buildTemplate(
            baseAssets.js,
            [...baseAssets.css, ...(assets?.css || [])],
            assets?.js
          );

          await writePage(serverFilename, url, { preloadedData, initialProps }, template);
        })
      );
    },
  };
}

async function clean(dirpath: string) {
  await rmAsync(path.join(dirpath), { recursive: true, force: true });
}
