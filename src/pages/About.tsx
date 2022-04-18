import { Link } from 'components/Link';
import { PageProps } from 'routes';

export function getStaticProps() {
  return { foo: 'baz' };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function About({ staticProps }: PageProps<ReturnType<typeof getStaticProps>>) {
  console.log({ staticProps });
  return (
    <div>
      <h1>ABOUT</h1>
      <Link to="/">home</Link>
    </div>
  );
}
