import { createRequire } from 'module';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { build, Plugin, ResolvedConfig } from 'vite';
import { writePage } from './utils/pageUtils';
import { getUrlToPageAssets } from './utils/routeUtils';
import { buildTemplate } from './utils/templateUtils';

const SSG_MODE = 'ssg';

const require = createRequire(/* @vite-ignore */ import.meta.url);

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
          outDir: '.generator/build',
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { importedCss } = (chunk as any)?.viteMetadata || {};

            return [
              chunk.facadeModuleId,
              { css: importedCss ? Array.from(importedCss) : [], js: asset },
            ];
          }),
      );
    },

    async closeBundle() {
      if (resolvedConfig.mode === SSG_MODE) {
        return;
      }

      const buildDir = path.join(resolvedConfig.root, '.generator');
      const serverFilename = 'server.js';
      const serverFilepath = path.resolve(buildDir, serverFilename);

      await build({
        mode: SSG_MODE,
        logLevel: 'silent',
        build: {
          outDir: buildDir,
          ssr: require.resolve('@blog/core/server.tsx'),
          rollupOptions: {
            output: {
              format: 'es',
            },
          },
        },
      });

      const { preloader, routes } = await import(serverFilepath);

      const preloadedData = await preloader();

      const urlToGetStaticProps = await getUrlToPageAssets(routes, manifest, resolvedConfig.root);

      const baseAssets = manifest[require.resolve('@blog/core/client.tsx')];

      await Promise.all(
        Object.entries(urlToGetStaticProps).map(async ([url, assets]) => {
          const initialProps = (await assets?.getStaticProps()) || {};

          const template = buildTemplate(
            baseAssets.js,
            [...baseAssets.css, ...(assets?.css || [])],
            assets?.js,
          );

          await writePage(
            resolvedConfig.root,
            serverFilepath,
            url,
            { preloadedData, initialProps },
            template,
          );
        }),
      );
    },
  };
}
