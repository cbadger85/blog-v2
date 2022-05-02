import { PagePropsFromStaticProps } from '@blog/core/types';

export function getStaticPaths() {
  return [
    {
      item: ['foo', 'bar'],
    },
    {
      item: ['baz', 'zoo'],
    },
    {
      item: ['a', 'b', 'c'],
    },
  ];
}

export function getStaticProps(ctx: { params: Record<string, string | string[]> }) {
  return { item: ctx?.params.item };
}

export default function Post({ item }: PagePropsFromStaticProps<typeof getStaticProps>) {
  return <div>{Array.isArray(item) ? item.join(', ') : item}</div>;
}
