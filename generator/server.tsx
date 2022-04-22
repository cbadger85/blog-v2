import { StaticRouter } from 'react-router-dom/server.js';
import { FC, StrictMode } from 'react';
import { renderToPipeableStream, PipeableStream } from 'react-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { App } from '@generator/components/App';
import { AppProps } from './types';

const CustomApp: FC<AppProps> | undefined = Object.values(
  import.meta.globEager('@app/app.(tsx|ts|jsx|js)')
)[0]?.default;

interface PageData {
  preloadedData: unknown;
  initialProps: unknown;
}

type OnReadyCallback = (
  stream: PipeableStream,
  hydratedHelmetData: HelmetServerState,
  e: unknown
) => void;

export function render(
  url: string,
  { preloadedData, initialProps }: PageData,
  onAllReady: OnReadyCallback
) {
  const helmetData = {};
  const stream = renderToPipeableStream(
    <StrictMode>
      <HelmetProvider context={helmetData}>
        <StaticRouter location={url}>
          {CustomApp ? (
            <CustomApp Component={App} initialProps={initialProps} preloadedData={preloadedData} />
          ) : (
            <App initialProps={initialProps} />
          )}
        </StaticRouter>
      </HelmetProvider>
    </StrictMode>,
    {
      onShellError: (e) => onAllReady(stream, {} as HelmetServerState, e),
      onAllReady: () => {
        const { helmet } = helmetData as HelmetData['context'];

        onAllReady(stream, helmet, null);
      },
    }
  );
}

export const preloader =
  Object.values(import.meta.globEager('@app/server.(tsx|ts|jsx|js)'))[0]?.preloader ||
  function preloader() {
    return {};
  };

export { routes } from '@generator/routes';
