import { Link, FromStaticProps, StaticPropsContext } from '@blog/core';
import crypto from 'crypto';
import styles from './about.module.css';

export function getStaticProps(_ctx: StaticPropsContext) {
  return { foo: crypto.randomBytes(48).toString('hex') };
}

export default function About(props: FromStaticProps<typeof getStaticProps>) {
  return (
    <div>
      <h1 className={styles.heading}>ABOUT</h1>
      <Link to="/">home</Link>
      <div>{JSON.stringify(props, null, 2)}</div>
    </div>
  );
}
