import type { HelmetServerState } from 'react-helmet-async';

interface TemplateData {
  preloadedData: unknown;
  initialProps: unknown;
}

const SSG_DATA = '<!--ssr-data-->';
const SSG_HTML_ATTRIBUTES = 'data-ssr-html-attributes';
const SSG_TITLE = '<!--ssr-title-->';
const SSG_META = '<!--ssr-meta-->';
const SSG_LINK = '<!--ssr-link-->';
const SSG_BODY_ATTRIBUTES = 'data-ssr-body-attributes';

export function buildTemplate(entrypoint: string, css?: string[], js?: string): string {
  return `
  <!DOCTYPE html>
  <html ${SSG_HTML_ATTRIBUTES}>
    <head>
      ${SSG_TITLE}
      ${SSG_META}
      ${SSG_LINK}
      ${
        css
          ? css.map((stylesheet) => `<link href="/${stylesheet}" rel="stylesheet"></link>`).join('')
          : ''
      }
      <script type="module" crossorigin src="/${entrypoint}"></script>
      ${js ? `<script type="module" crossorigin src="/${js}"></script>` : ''}
    </head>
    <body ${SSG_BODY_ATTRIBUTES}>
      <div id="root"><!--ssr--></div>
      ${SSG_DATA}
    </body>
  </html>
  `;
}

export function hydrateTemplate(
  template: string,
  helmetData: HelmetServerState,
  { preloadedData, initialProps }: TemplateData
): string {
  const contextScript =
    `<script>(function() { ` +
    `window.__PRELOADED_DATA__ = ${JSON.stringify(preloadedData)}; ` +
    `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)} ` +
    `})()</script>`;

  return template
    .replace(SSG_DATA, contextScript)
    .replace(SSG_HTML_ATTRIBUTES, helmetData.htmlAttributes.toString())
    .replace(SSG_TITLE, helmetData.title.toString())
    .replace(SSG_META, helmetData.meta.toString())
    .replace(SSG_LINK, helmetData.link.toString())
    .replace(SSG_BODY_ATTRIBUTES, helmetData.bodyAttributes.toString());
}
