import { type Plugin } from 'vite';
import { stripIndent } from 'common-tags';

export default function injectMarkdown(): Plugin {
  return {
    name: 'ssg:markdown',

    async transform(code, id) {
      if (id.endsWith('.md')) {
        const data = parseCode(code);
        return {
          code: getTransformCode(data),
        };
      }

      return undefined;
    },

    buildEnd(err) {
      // eslint-disable-next-line no-console
      console.error(err);
    },
  };
}

interface MarkdownData {
  markdown: string;
}

function parseCode(code: string): MarkdownData {
  return { markdown: code.replace(/'/g, "\\'").replace(/\r?\n|\r/g, `\\n' + '`) };
}

function getTransformCode({ markdown }: MarkdownData): string {
  return stripIndent`
    export default '${markdown}';
  `;
}
