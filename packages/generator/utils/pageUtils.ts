/* eslint-disable no-console */
import { createWriteStream, promises as fsPromises } from 'fs';
import path from 'path';
import { PipeableStream } from 'react-dom/server';
import { HelmetServerState } from 'react-helmet-async';
import { hydrateTemplate } from './templateUtils';

const { writeFile: writeFileAsync, mkdir: mkdirAsync } = fsPromises;

export async function writePage(
  root: string,
  url: string,
  pageData: PageData,
  template: string
): Promise<void> {
  const filepath = path.join(root, 'build', url);

  const htmlFilepath = ['/404', '/505'].includes(url)
    ? `${filepath}.html`
    : path.join(filepath, 'index.html');

  const htmlFile = writeHtmlFile(
    root,
    {
      filepath: htmlFilepath,
      path: url,
    },
    pageData,
    template
  ).then(() => console.log(path.relative(root, htmlFilepath)));

  await htmlFile;

  if (!pageData.initialProps) {
    await htmlFile;
  } else {
    const jsonFilepath = path.join(filepath, 'index.json');

    const jsonFile = writeJsonFile(jsonFilepath, pageData.initialProps).then(() =>
      console.log(path.relative(root, jsonFilepath))
    );

    await Promise.all([htmlFile, jsonFile]);
  }
}

async function writeJsonFile(filepath: string, initialProps: unknown): Promise<void> {
  await createDir(filepath);
  await writeFileAsync(filepath, JSON.stringify(initialProps || {}));
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
  pathToServerFile: astring,
  pageInfo: PageInfo,
  { preloadedData, initialProps }: PageData,
  template: string
): Promise<void> {
  await createDir(pageInfo.filepath);

  const { render } = await import(pathToServerFile);

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
