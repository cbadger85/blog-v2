import { Link } from '@generator/router';
import { PageProps } from '@generator/types';
import crypto from 'crypto';

export function getStaticProps() {
  return { foo: crypto.randomBytes(48).toString('hex') };
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
