import { Link, FromStaticProps, StaticPropsContext } from '@blog/core';

export function getStaticProps(_ctx: StaticPropsContext) {
  return { foo: 'bar' };
}

export default function Home(props: FromStaticProps<typeof getStaticProps>) {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="/about">about</Link>
      <div>{JSON.stringify(props, null, 2)}</div>
      <Link to="/posts">posts</Link>
    </div>
  );
}
