import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
import { Route, Routes } from 'components/Router';
import 'index.css';
import { lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import styles from './app.module.css';

interface AppProps {
  context?: unknown;
}
const Home = lazy(() => import('pages/Home').then((module) => ({ default: module.Home })));
const About = lazy(() => import('pages/About').then((module) => ({ default: module.About })));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ context }: AppProps) {
  return (
    <div className={styles.app} id="App">
      <Helmet htmlAttributes={{ lang: 'en' }}>
        <title>React App</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <h1>React App</h1>
      <Suspense>
        <ErrorBoundary>
          <Routes fallback={<div>Oops</div>}>
            <Route path="/">
              <Home />
            </Route>
            <Route path="/about">
              <About />
            </Route>
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
