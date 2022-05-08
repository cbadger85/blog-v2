import { FromStaticProps, StaticPropsContext } from '@blog/core';
import { createElement, Fragment, useMemo } from 'react';
import rehypeReact from 'rehype-react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

export async function getStaticPaths() {
  const posts = (await import('../../content')).getPosts();
  return posts.map((slug) => ({ slug }));
}
export async function getStaticProps({ params: { slug } }: StaticPropsContext<{ slug: string }>) {
  const content = await import(/* @vite-ignore */ `../../../content/posts/${slug}/index.md`).then(
    (m) => m.default,
  );

  return { slug, content };
}

export default function Post({ content }: FromStaticProps<typeof getStaticProps>) {
  const MdComponent = useMemo(
    () =>
      unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeReact, { createElement, Fragment })
        .processSync(content).result,
    [content],
  );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <div>{MdComponent}</div>;
}
