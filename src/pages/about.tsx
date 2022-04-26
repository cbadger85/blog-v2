import { Link } from '@generator/router';
import { PagePropsFromStaticProps } from '@generator/types';
import crypto from 'crypto';

export function getStaticProps() {
  return { foo: crypto.randomBytes(48).toString('hex') };
}

export default function About(props: PagePropsFromStaticProps<typeof getStaticProps>) {
  return (
    <div>
      <h1>ABOUT</h1>
      <Link to="/">home</Link>
      <div>{JSON.stringify(props, null, 2)}</div>
    </div>
  );
}
