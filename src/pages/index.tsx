import { Link } from '@generator/link';
import { PageProps } from '@generator/types';

export function getStaticProps() {
  return { foo: 'bar' };
}

export default function Home({ staticProps }: PageProps<ReturnType<typeof getStaticProps>>) {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="/about">about</Link>
      <div>{JSON.stringify(staticProps, null, 2)}</div>
    </div>
  );
}
