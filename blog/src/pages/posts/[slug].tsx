import { FromStaticProps, StaticPropsContext } from '@blog/core';
import { Fragment, ReactElement, useEffect, useState, createElement } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReact from 'rehype-react';

export async function getStaticPaths() {
  const { getPosts } = await import('../../content');
  const posts = await getPosts();
  return Object.keys(posts).map((slug) => ({ slug }));
}
export async function getStaticProps({ params: { slug } }: StaticPropsContext<{ slug: string }>) {
  const { getPosts } = await import('../../content');
  const posts = await getPosts();
  const content = posts[slug];

  // post.module().then((m) => console.log(m));

  return { slug, content };
}

export default function Post({ content }: FromStaticProps<typeof getStaticProps>) {
  const [Content, setContent] = useState<ReactElement>();

  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeReact, { createElement, Fragment })
      .process(content)
      .then((file) => setContent(file.result));
  });

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <div>{Content || <></>}</div>;
}
