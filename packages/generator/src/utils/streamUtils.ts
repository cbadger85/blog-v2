import type { render } from '@blog/core/server';
import { WriteStream } from 'fs';
import { ServerResponse } from 'http';
import { hydrateHelmetData, SSG_DIVIDER } from './templateUtils';

export type RenderFn = typeof render;

interface PageDetails {
  url: string;
  template: string;
  preloadedData: unknown;
  initialProps: unknown;
}

export function renderToStream(
  stream: WriteStream | ServerResponse,
  renderFn: RenderFn,
  details: PageDetails,
) {
  renderFn(
    details.url,
    {
      preloadedData: details.preloadedData,
      initialProps: details.initialProps,
    },
    ({ pipe }, helmetData, err) => {
      if (err) {
        throw err;
      }

      const [header, body] = hydrateHelmetData(details.template, helmetData).split(SSG_DIVIDER);

      stream.write(header);
      pipe(stream);
      stream.write(body);
      stream.end();
    },
  );
}
