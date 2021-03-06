import { promises } from 'fs';
import path from 'path';
import { ResolvedConfig, type Plugin } from 'vite';
import { createDir, rmDir } from './utils/fileUtils';
import { getTransformCode, parseCode } from './utils/mdUtils';

const SSG_MODE = 'ssg';

export default function injectMarkdown(): Plugin {
  let resolvedConfig: ResolvedConfig;

  return {
    name: 'ssg:markdown',

    async configResolved(config) {
      resolvedConfig = config;

      if (resolvedConfig.mode === SSG_MODE || resolvedConfig.command === 'serve') {
        await rmDir(path.join(process.cwd(), 'public/content'));
      }
    },

    async transform(code, id) {
      if (id.endsWith('.md')) {
        const slug = path.basename(path.dirname(id));

        const data = await parseCode(code, {
          public: `/content/${slug}`,
        });

        if (resolvedConfig.mode === SSG_MODE || resolvedConfig.command === 'serve') {
          const imageDir = path.join(process.cwd(), 'public/content', slug);

          await createDir(imageDir);

          const contentDir = path.dirname(id);

          await Promise.all(
            data.images.map(async (image) => {
              promises.copyFile(path.join(contentDir, image), path.join(imageDir, image));
            }),
          );
        }

        return {
          code: getTransformCode(data),
        };
      }

      return undefined;
    },

    buildEnd(err) {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },

    // resolveFileUrl(options) {
    //   console.log('resolveFileUrl');
    //   console.dir(options);
    // },
  };
}
