import { PageProps } from 'routes';

export function getStaticProps() {
  return { foo: 'baz' };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function About({ staticProps }: PageProps<ReturnType<typeof getStaticProps>>) {
  return (
    <div>
      <h1>ABOUT</h1>
      <a href="/">home</a>
    </div>
  );
}
