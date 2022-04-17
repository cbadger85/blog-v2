import { StaticRouter } from 'react-router-dom/server.js';
import { StrictMode } from 'react';
import { renderToPipeableStream, PipeableStream } from 'react-dom/server';
import { HelmetData, HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { Writable } from 'stream';
import App from './App';

export function render(
  url: string,
  preloadedData: unknown,
  initialProps: unknown,
  onAllReady: (stream: PipeableStream, hydratedHelmetData: HelmetServerState) => Writable
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
      // eslint-disable-next-line no-console
      onShellError: (e) => console.error(e),
      onAllReady: () => {
        const { helmet } = helmetData as HelmetData['context'];

        onAllReady(stream, helmet);
      },
    }
  );
}

export { preloader } from './loaders';
export { routes } from './routes';
