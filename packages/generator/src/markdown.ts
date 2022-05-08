import { type Plugin } from 'vite';
import { stripIndent } from 'common-tags';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify';

export default function injectMarkdown(): Plugin {
  return {
    name: 'ssg:markdown',

    async transform(code, id) {
      if (id.endsWith('.md')) {
        const data = await parseCode(code);
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

interface ContentData {
  content: string;
}

async function parseCode(code: string): Promise<ContentData> {
  const vfile = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(code);

  return {
    content: String(vfile),
  };
}

function getTransformCode({ content }: ContentData): string {
  return stripIndent`
    export const content = ${JSON.stringify(content)};
  `;
}
