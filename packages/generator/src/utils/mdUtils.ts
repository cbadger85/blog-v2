/* eslint-disable no-param-reassign */
import { type HastRoot } from 'remark-rehype/lib';
import { unified, type Plugin, type Transformer } from 'unified';
import { stripIndent } from 'common-tags';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeToc from 'rehype-toc';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkParseFrontmatter from 'remark-parse-frontmatter';
import remarkRehype from 'remark-rehype';
import { selectAll, select, HastNode } from 'hast-util-select';
import { Root } from 'hast-util-select/lib/types';
import rehypeHighlight from 'rehype-highlight';

interface ContentData {
  content: string;
  toc?: string;
  frontmatter: unknown;
  images: string[];
}

const remarkImageRewrite: Plugin<{ public?: string }[], Root, void> = (
  options = { public: '/' },
) => {
  return ((tree, vfile) => {
    const imageTags = selectAll('img', tree as HastNode);

    vfile.data.images = imageTags
      .map((a) => (a.properties?.src as string | undefined)?.replace(/^\//, ''))
      .filter(Boolean);

    imageTags.forEach((a) => {
      const relativeUrl = (a.properties?.src as string | undefined)?.replace(/^\//, '');
      const src = `${options.public}/${relativeUrl}`;

      if (a.properties) {
        a.properties.src = src;
      } else {
        a.properties = { src };
      }
    });
  }) as Transformer;
};

interface ParseCodeOptions {
  public?: string;
}

export async function parseCode(
  code: string,
  options: ParseCodeOptions = {},
): Promise<ContentData> {
  const remarkToRehype = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkParseFrontmatter)
    .use(remarkRehype)
    .use(rehypeSlug)
    .freeze();

  const tocVFile = await remarkToRehype()
    .use(rehypeToc)
    .use(() => (tree: HastRoot) => {
      const toc = select('nav', tree);

      tree.children = toc ? [toc] : [];
    })
    .use(rehypeStringify)
    .process(code);

  const contentVFile = await remarkToRehype()
    .use(remarkImageRewrite, { public: options.public })
    .use(rehypeAutolinkHeadings)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(code);

  return {
    content: String(contentVFile),
    frontmatter: contentVFile.data?.frontmatter,
    toc: String(tocVFile),
    images: (contentVFile.data?.images as string[] | undefined) || [],
  };
}

export function getTransformCode({ content, frontmatter, toc }: ContentData): string {
  return stripIndent`
    export const content = ${JSON.stringify(content)};
    export const frontmatter = ${JSON.stringify(frontmatter)};
    export const toc = ${JSON.stringify(toc)};
  `;
}
