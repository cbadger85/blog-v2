import { FromStaticProps, StaticPropsContext } from '@blog/core';
import { createElement, Fragment, useMemo } from 'react';
import rehypeReact from 'rehype-react';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';

export async function getStaticPaths() {
  const posts = (await import('../../content')).getPosts();
  return posts.map((slug) => ({ slug }));
}
export async function getStaticProps({ params: { slug } }: StaticPropsContext<{ slug: string }>) {
  const { content, frontmatter } = await import(
    /* @vite-ignore */ `../../../content/posts/${slug}/index.md`
  );

  return { slug, content, frontmatter };
}

export default function Post({ content }: FromStaticProps<typeof getStaticProps>) {
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
  return <div>{MdComponent}</div>;
}
