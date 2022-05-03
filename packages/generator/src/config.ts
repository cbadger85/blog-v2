import { createRequire } from 'module';
import { Plugin } from 'vite';

const SSG_MODE = 'ssg';

const require = createRequire(/* @vite-ignore */ import.meta.url);

export default function ssgConfig(): Plugin {
  return {
    name: 'ssg:config',

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
  };
}
