import { promises } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import type { OutputChunk } from 'rollup';
import { fileURLToPath } from 'url';
import { build, Plugin, ResolvedConfig } from 'vite';
import { writePageFiles } from './utils/fileUtils';
import { getUrlToPageAssets, Manifest } from './utils/pageUtils';

const SSG_MODE = 'ssg';

const require = createRequire(/* @vite-ignore */ import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function ssgBuild(): Plugin {
  let resolvedConfig: ResolvedConfig;
  let manifest: Manifest;

  return {
    name: 'ssg:build',
    apply: 'build',
    enforce: 'post',

    configResolved(config) {
      resolvedConfig = config;
    },

    generateBundle(options, bundle) {
      if (resolvedConfig.mode === SSG_MODE) {
        return;
      }

      manifest = Object.fromEntries(
        Object.entries(bundle)
          .filter(([, c]) => c.type === 'chunk')
          .map(([asset, output]) => {
            const chunk = output as OutputChunk;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { importedCss } = (chunk as any)?.viteMetadata || {}; // TODO: See what other values this has in it.

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

      const tempDir = path.join(__dirname, 'public');

      await promises.mkdir(path.join(__dirname, 'public'));

      await build({
        mode: SSG_MODE,
        logLevel: 'silent',
        publicDir: tempDir,
        build: {
          outDir: buildDir,
          emptyOutDir: false,
          ssr: require.resolve('@blog/core/server.tsx'),
          rollupOptions: {
            output: {
              format: 'es',
            },
          },
        },
      });

      const { routes, preloader, render } = await import(serverFilepath);

      const urlToPageAssets = await getUrlToPageAssets(routes, manifest, resolvedConfig.root);

      const baseAssets = manifest[require.resolve('@blog/core/client.tsx')];

      const preloadedData = await preloader();

      await Promise.all(
        Object.entries(urlToPageAssets).map(([url, assets]) =>
          writePageFiles(resolvedConfig.root, render, { url, baseAssets, assets, preloadedData }),
        ),
      );
    },
  };
}
