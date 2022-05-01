/* eslint-disable no-console */
import { getUrlToGetStaticProps } from '@generator/utils';
import dotenv from 'dotenv';
import { createWriteStream, promises as fsPromises } from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetServerState } from 'react-helmet-async';
import { build } from 'vite';

const {
  readFile: readFileAsync,
  writeFile: writeFileAsync,
  rm: rmAsync,
  mkdir: mkdirAsync,
} = fsPromises;

dotenv.config();

const root = process.cwd();

async function generate() {
  try {
    await clean();

    await build({ mode: 'build' });

    const template = await readFileAsync(path.resolve(root, 'build/index.html'), 'utf8');

    await build({ mode: 'ssr' }); // look into using mkdtemp

    const { preloader, routes } = await import(path.resolve(root, 'generator/_lib/server.js'));

    const preloadedData = await preloader();

    const urlToGetStaticProps = await getUrlToGetStaticProps(routes);

    await Promise.all(
      Object.entries(urlToGetStaticProps).map(async ([url, getStaticProps]) => {
        const staticProps = await getStaticProps();

        await writePage(url, { preloadedData, initialProps: staticProps }, template);
      })
    );
  } catch (e: unknown) {
    console.error(e);
  }
}

async function writePage(url: string, pageData: PageData, template: string): Promise<void> {
  const filepath = path.join(root, 'build', url);

  const htmlFilepath = ['/404', '/505'].includes(url)
    ? `${filepath}.html`
    : path.join(filepath, 'index.html');

  const htmlFile = writeHtmlFile(
    {
      filepath: htmlFilepath,
      path: url,
    },
    pageData,
    template
  ).then(() => console.log(path.relative(root, htmlFilepath)));

  if (!pageData.initialProps) {
    await htmlFile;
  } else {
    const jsonFilepath = path.join(filepath, 'index.json');

    const jsonFile = createDir(jsonFilepath).then(() =>
      writeFileAsync(jsonFilepath, JSON.stringify(pageData.initialProps || {})).then(() =>
        console.log(path.relative(root, jsonFilepath))
      )
    );

    await Promise.all([htmlFile, jsonFile]);
  }
}

async function clean() {
  await rmAsync(path.join(root, 'generator/_lib'), { recursive: true, force: true });
}

interface PageData {
  preloadedData: unknown;
  initialProps: unknown;
}

interface PageInfo {
  path: string;
  filepath: string;
}

async function writeHtmlFile(
  pageInfo: PageInfo,
  { preloadedData, initialProps }: PageData,
  template: string
): Promise<void> {
  await createDir(pageInfo.filepath);

  const { render } = await import(path.resolve(root, 'generator/_lib/server.js'));

  return new Promise((resolve, reject) => {
    const htmlWriteStream = createWriteStream(pageInfo.filepath);

    render(
      pageInfo.path,
      { preloadedData, initialProps },
      ({ pipe }: PipeableStream, helmetData: HelmetServerState, err: unknown) => {
        if (err !== null) {
          reject(err);
        }
        const [header, body] = hydrateTemplate(template, helmetData, {
          preloadedData,
          initialProps,
        }).split('<!--ssr-->');

        htmlWriteStream.write(header, 'utf-8');
        pipe(htmlWriteStream);
        htmlWriteStream.write(body);
        htmlWriteStream.end();
      }
    );

    htmlWriteStream.on('error', (e: Error) => {
      console.error(e);
      reject(e);
    });

    htmlWriteStream.on('finish', () => {
      resolve();
    });
  });
}

async function createDir(filepath: string) {
  const dirname = path.dirname(filepath);

  await mkdirAsync(dirname, { recursive: true }).catch((e) => console.error(e));
}

interface TemplateData {
  preloadedData: unknown;
  initialProps: unknown;
}

function hydrateTemplate(
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
    .replace('<!--ssr-data-->', contextScript)
    .replace('data-ssr-html-attributes', helmetData.htmlAttributes.toString())
    .replace('<!--ssr-title-->', helmetData.title.toString())
    .replace('<!--ssr-meta-->', helmetData.meta.toString())
    .replace('<!--ssr-link-->', helmetData.link.toString())
    .replace('data-ssr-body-attributes', helmetData.bodyAttributes.toString());
}

generate();
