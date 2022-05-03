import { StaticRouter } from 'react-router-dom/server.js';
import { StrictMode } from 'react';
import { renderToPipeableStream, PipeableStream } from 'react-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { App } from './components/App';
import config from './config';

interface PageData {
  preloadedData: unknown;
  initialProps: unknown;
}

type OnReadyCallback = (
  stream: PipeableStream,
  hydratedHelmetData: HelmetServerState,
  e: unknown,
) => void;

export function render(
  url: string,
  { preloadedData, initialProps }: PageData,
  onAllReady: OnReadyCallback,
) {
  const helmetData = {};
  const stream = renderToPipeableStream(
    <StrictMode>
      <HelmetProvider context={helmetData}>
        <StaticRouter location={url}>
          {config.AppComponent ? (
            <config.AppComponent
              Component={App}
              initialProps={initialProps}
              preloadedData={preloadedData}
            />
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
    },
  );
}
