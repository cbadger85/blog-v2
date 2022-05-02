import { Link } from '@blog/core/router';
import { PagePropsFromStaticProps } from '@blog/core/types';

export function getStaticProps() {
  return { foo: 'bar' };
}

export default function Home(props: PagePropsFromStaticProps<typeof getStaticProps>) {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="/about">about</Link>
      <div>{JSON.stringify(props, null, 2)}</div>
      <Link to="/posts">posts</Link>
    </div>
  );
}
