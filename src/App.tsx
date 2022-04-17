import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'index.css';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './app.module.css';
import { routes } from './routes';

interface AppProps {
  initialProps?: any;
  preloadedData?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ initialProps = {}, preloadedData = {} }: AppProps) {
  const staticProps = useLocation().state || initialProps;

  console.log(staticProps);

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
          <Routes>
            {Object.entries(routes).map(([path, { component: Component }]) => (
              <Route key={path} path={path} element={<Component staticProps={staticProps} />} />
            ))}
            <Route element={<div>Oops</div>} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
