import { StaticRouter } from 'react-router-dom/server.js';
import { StrictMode } from 'react';
import { renderToPipeableStream, PipeableStream } from 'react-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import App from './App';

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
          <App preloadedData={preloadedData} initialProps={initialProps} />
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

export { preloader } from './loaders';
export { routes } from './routes';
