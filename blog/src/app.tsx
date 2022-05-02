import { type AppProps, Head } from '@blog/core';
import styles from './app.module.css';
import './app.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ Component, initialProps, preloadedData }: AppProps) {
  return (
    <div className={styles.app} id="App">
      <Head htmlAttributes={{ lang: 'en' }}>
        <title>React App</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <h1>React App</h1>
      <Component
        initialProps={initialProps}
        onError={(error, errorInfo) => {
          // eslint-disable-next-line no-console
          console.error(error);
          // eslint-disable-next-line no-console
          console.log(errorInfo);
        }}
      />
    </div>
  );
}
