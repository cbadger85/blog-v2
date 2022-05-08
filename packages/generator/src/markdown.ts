import { type Plugin } from 'vite';
import { stripIndent } from 'common-tags';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeToc from 'rehype-toc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParseFrontmatter from 'remark-parse-frontmatter';

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
  frontmatter: unknown;
}

async function parseCode(code: string): Promise<ContentData> {
  const vfile = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkParseFrontmatter)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeToc)
    .use(rehypeStringify)
    .process(code);

  return {
    content: String(vfile),
    frontmatter: vfile.data?.frontmatter,
  };
}

function getTransformCode({ content, frontmatter }: ContentData): string {
  return stripIndent`
    export const content = ${JSON.stringify(content)};
    export const frontmatter = ${JSON.stringify(frontmatter)};
  `;
}
