import { Link } from 'components/Link';
import { PageProps } from 'routes';

export function getStaticProps() {
  return { foo: 'bar' };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Home({ staticProps }: PageProps<ReturnType<typeof getStaticProps>>) {
  return (
    <div>
      <h1>HOME</h1>
      <Link to="/about">about</Link>
      <div>{JSON.stringify(staticProps, null, 2)}</div>
    </div>
  );
}
