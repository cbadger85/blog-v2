import { Link } from '@generator/link';
import { PageProps } from '@generator/types';

export function getStaticProps() {
  return { foo: 'baz' };
}

export default function About({ staticProps }: PageProps<ReturnType<typeof getStaticProps>>) {
  return (
    <div>
      <h1>ABOUT</h1>
      <Link to="/">home</Link>
      <div>{JSON.stringify(staticProps, null, 2)}</div>
    </div>
  );
}
