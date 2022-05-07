import { FromStaticProps, StaticPropsContext } from '@blog/core';

export function getStaticPaths() {
  return [
    {
      item: ['foo', 'bar'],
      content: 'content',
    },
    {
      item: ['baz', 'zoo'],
      content: 'content',
    },
    {
      item: ['a', 'b', 'c'],
      content: 'content',
    },
  ];
}

export function getStaticProps(ctx: StaticPropsContext) {
  return { item: ctx.params.item };
}

export default function Post({ item }: FromStaticProps<typeof getStaticProps>) {
  return <div>{Array.isArray(item) ? item.join(', ') : item}</div>;
}
