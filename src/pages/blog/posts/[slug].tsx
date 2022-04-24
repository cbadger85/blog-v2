import { PageProps } from '@generator/types';

export function getStaticPaths() {
  return [
    {
      slug: 'first-post',
    },
    { slug: 'second-post' },
  ];
}

export function getStaticProps(ctx: { params: Record<string, string | string[]> }) {
  return { slug: ctx?.params.slug };
}

export default function Post(props: PageProps<{ slug: string }>) {
  return <div>{props.staticProps.slug}</div>;
}
