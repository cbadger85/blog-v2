import { ErrorBoundary } from 'components/ErrorBoundary';
import { Page } from 'components/Page';
import { PageDataCache } from 'components/PageDataCache/PageDataCache';
import 'index.css';
import { Suspense, isValidElement, FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { Route, Routes, useLocation } from 'react-router-dom';
import { hasOwnProperty } from 'utils';
import styles from './app.module.css';
import { NOT_FOUND_PAGE, PageConfig, RouteConfig, routes } from './routes';

interface AppProps {
  initialProps?: unknown;
  preloadedData?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function App({ initialProps = {}, preloadedData = {} }: AppProps) {
  const { pathname } = useLocation();

  return (
    <PageDataCache initialProps={initialProps}>
      <div className={styles.app} id="App">
        <Helmet htmlAttributes={{ lang: 'en' }}>
          <title>React App</title>
          <meta charSet="UTF-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
        <h1>React App</h1>
        <Suspense fallback={getSuspenseFallback(pathname)}>
          <ErrorBoundary fallback={getErrorFallback(pathname)}>
            <Routes>
              {Object.entries(routes).map(([path, page]) => (
                <Route
                  key={path}
                  path={path}
                  element={<Page component={getPageComponent(page)} />}
                />
              ))}
              <Route path="*" element={getNotFoundPage()} />
            </Routes>
          </ErrorBoundary>
        </Suspense>
      </div>
    </PageDataCache>
  );
}

function getSuspenseFallback(pathname: string) {
  const page = routes[pathname];

  if (hasOwnProperty(page, 'loadingFallback') && isValidElement(page.loadingFallback)) {
    return page.loadingFallback;
  }

  return null;
}

function getErrorFallback(pathname: string) {
  const page = routes[pathname];

  if (hasOwnProperty(page, 'errorFallback') && isValidElement(page.errorFallback)) {
    return page.errorFallback;
  }

  return null;
}

function getPageComponent(page: RouteConfig) {
  if (hasOwnProperty(page, 'component')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return page.component as PageConfig<any>['component'];
  }

  return (() => null) as FC;
}

function getNotFoundPage() {
  const page = routes[NOT_FOUND_PAGE];

  if (hasOwnProperty(page, 'element') && isValidElement(page.element)) {
    return page.element;
  }

  return null;
}
