import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import config from '../../config';
import { ErrorBoundary } from '../ErrorBoundary';
import { Page } from '../Page';
import { PageDataCache } from '../PageDataCache';

export interface AppPageProps {
  initialProps: unknown;
  onError?: (error: Error, errorInfo: unknown) => void;
}

export function App({ initialProps = {}, onError }: AppPageProps) {
  return (
    <PageDataCache initialProps={initialProps}>
      <Suspense>
        <ErrorBoundary fallback={<config.ErrorPage />} onError={onError}>
          <Routes>
            {config.routes.map(({ path, component }) => (
              <Route key={path} path={path} element={<Page component={component} />} />
            ))}
            <Route path="*" element={<config.NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </PageDataCache>
  );
}
