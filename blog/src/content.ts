import { promises } from 'fs';
import path from 'path';

function filenameToSlug(filename: string): string {
  return filename.replace('/content/posts/', '').replace('/index.mdx', '');
}

interface Post {
  filepath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: () => Promise<{ [key: string]: any }>;
}

export const posts = Object.fromEntries(
  Object.entries(import.meta.glob('/content/posts/**/*.mdx')).map<[string, Post]>(
    ([file, module]) => [filenameToSlug(file), { filepath: file, module }],
  ),
);

export async function getPosts() {
  const slugs = await promises.readdir(path.join(process.cwd(), 'content/posts'));

  return Object.fromEntries(
    await Promise.all(
      slugs.map<Promise<[string, string]>>(async (slug) => {
        const post = await promises.readFile(
          path.join(process.cwd(), 'content/posts', slug, 'index.md'),
          'utf-8',
        );

        return [slug, post];
      }),
    ),
  );
}
