import { Router } from 'components/Router';
import { StrictMode } from 'react';
import { renderToPipeableStream, PipeableStream } from 'react-dom/server';
import { Writable } from 'stream';
import App from './App';

export function render(
  url: string,
  context: unknown,
  onAllReady: (stream: PipeableStream) => Writable
) {
  const stream = renderToPipeableStream(
    <StrictMode>
      <Router location={url}>
        <App context={context} />
      </Router>
    </StrictMode>,
    {
      // eslint-disable-next-line no-console
      onShellError: (e) => console.error(e),
      onAllReady: () => onAllReady(stream),
    }
  );
}
