import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
import { Route, Routes } from 'components/Router';
import 'index.css';
import { lazy, Suspense } from 'react';
import styles from './app.module.css';

interface AppProps {
  context?: unknown;
}
const Home = lazy(() => import('pages/Home').then((module) => ({ default: module.Home })));
const About = lazy(() => import('pages/About').then((module) => ({ default: module.About })));

export default function App({ context }: AppProps) {
  console.log(context);
  return (
    <div className={styles.app} id="App">
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
