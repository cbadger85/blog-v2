import { PagePropsFromStaticProps, StaticPropsContext } from '@generator/types';

export function getStaticPaths() {
  return [
    {
      slug: 'first-post',
    },
    { slug: 'second-post' },
  ];
}

export function getStaticProps(ctx: StaticPropsContext) {
  return { slug: ctx?.params.slug };
}

export default function Post({ slug }: PagePropsFromStaticProps<typeof getStaticProps>) {
  return <div>{slug}</div>;
}
