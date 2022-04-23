import { routes } from '@generator/routes';
import { ErrorBoundary } from '@generator/components/ErrorBoundary';
import { Page } from '@generator/components/Page';
import { PageDataCache } from '@generator/components/PageDataCache';
import { FC, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const ErrorPage: FC =
  Object.values(import.meta.globEager('@app/pages/500.(tsx|ts|jsx|js)'))[0]?.default ||
  (() => null);

const NotFoundPage: FC =
  Object.values(import.meta.globEager('@app/pages/404.(tsx|ts|jsx|js)'))[0]?.default ||
  (() => null);

export interface AppPageProps {
  initialProps: unknown;
  onError?: (error: Error, errorInfo: unknown) => void;
}

export function App({ initialProps = {}, onError }: AppPageProps) {
  return (
    <PageDataCache initialProps={initialProps}>
      <Suspense>
        <ErrorBoundary fallback={<ErrorPage />} onError={onError}>
          <Routes>
            {routes.map(({ path, component }) => (
              <Route key={path} path={path} element={<Page component={component} />} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </PageDataCache>
  );
}
