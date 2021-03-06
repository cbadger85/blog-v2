import { FromStaticProps, StaticPropsContext } from '@blog/core';
import { createElement, Fragment, useMemo } from 'react';
import rehypeReact from 'rehype-react';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import 'highlight.js/styles/github-dark.css';

export async function getStaticPaths() {
  const posts = (await import('../../content')).getPosts();
  return posts.map((slug) => ({ slug }));
}
export async function getStaticProps({ params: { slug } }: StaticPropsContext<{ slug: string }>) {
  const { content, frontmatter, toc } = await import(
    /* @vite-ignore */ `../../../content/posts/${slug}/index.md`
  );

  return { slug, content, frontmatter, toc };
}

export default function Post({ content, toc }: FromStaticProps<typeof getStaticProps>) {
  const TocComponent = useMemo(
    () =>
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .processSync(toc).result,
    [toc],
  );

  const MdComponent = useMemo(
    () =>
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeReact, {
          createElement,
          Fragment,
        })
        .processSync(content).result,
    [content],
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return (
    <div>
      {TocComponent}
      {MdComponent}
    </div>
  );
}
