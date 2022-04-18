import { ErrorBoundary } from 'components/ErrorBoundary/ErrorBoundary';
import { Page } from 'components/Page';
import { PageDataProvider } from 'components/PageDataProvider';
import 'index.css';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes } from 'react-router-dom';
import styles from './app.module.css';
import { routes } from './routes';

interface AppProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProps?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preloadedData?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ initialProps = {}, preloadedData = {} }: AppProps) {
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
          <PageDataProvider initialProps={initialProps}>
            <Routes>
              {Object.entries(routes).map(([path, { component }]) => (
                <Route key={path} path={path} element={<Page component={component} />} />
              ))}
              <Route path="*" element={<div>Oops</div>} />
            </Routes>
          </PageDataProvider>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
