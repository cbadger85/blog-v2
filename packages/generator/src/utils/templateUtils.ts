import type { HelmetServerState } from 'react-helmet-async';

interface TemplateData {
  preloadedData: unknown;
  initialProps: unknown;
  entryScript: string;
  css: string[];
  js?: string;
}

const SSG_DATA = '<!--ssg-data-->';
const SSG_HTML_ATTRIBUTES = 'data-ssg-html-attributes';
const SSG_TITLE = '<!--ssg-title-->';
const SSG_META = '<!--ssg-meta-->';
const SSG_LINK = '<!--ssg-link-->';
const SSG_SCRIPT = '<!--ssg-script-->';
const SSG_BODY_ATTRIBUTES = 'data-ssg-body-attributes';
export const SSG_DIVIDER = '<!--ssg-->';

export function buildHtmlPage({
  preloadedData,
  initialProps,
  entryScript,
  css,
  js,
}: TemplateData): string {
  const contextScript =
    `<script>(function() { ` +
    `window.__PRELOADED_DATA__ = ${JSON.stringify(preloadedData)}; ` +
    `window.__INITIAL_PROPS__ = ${JSON.stringify(initialProps)} ` +
    `})()</script>`;

  const template = `
  <!DOCTYPE html>
  <html ${SSG_HTML_ATTRIBUTES}>
    <head>
      ${SSG_TITLE}
      ${SSG_META}
      ${SSG_LINK}
      ${css.map((stylesheet) => `<link href="/${stylesheet}" rel="stylesheet">`).join('')}
      ${SSG_SCRIPT}
      <script type="module" crossorigin src="/${entryScript}"></script>
      ${js ? `<script type="module" crossorigin src="/${js}"></script>` : ''}
      <link href="/manifest.json" rel="manifest">
    </head>
    <body ${SSG_BODY_ATTRIBUTES}>
      <div id="root">${SSG_DIVIDER}</div>
      ${SSG_DATA}
    </body>
  </html>
  `;

  return template.replace(SSG_DATA, contextScript);
}

export function hydrateHelmetData(template: string, helmetData: HelmetServerState) {
  return template
    .replace(SSG_HTML_ATTRIBUTES, helmetData.htmlAttributes.toString())
    .replace(SSG_TITLE, helmetData.title.toString())
    .replace(SSG_META, helmetData.meta.toString())
    .replace(SSG_LINK, helmetData.link.toString())
    .replace(SSG_SCRIPT, helmetData.script.toString())
    .replace(SSG_BODY_ATTRIBUTES, helmetData.bodyAttributes.toString());
}
