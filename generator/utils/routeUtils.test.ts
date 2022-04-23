import { getPathFromSourcepath, getFilenameFromSourcepath } from '@generator/utils';

describe('getPathFromSourcepath', () => {
  const parameters = [
    ['src/pages/index.tsx', '/'],
    ['othergiberish/src/pages/index.tsx', '/'],
    ['../src/pages/index.tsx', '/'],
    ['src/pages/index/index.tsx', '/index'],
    ['src/pages/blog.ts', '/blog'],
    ['src/pages/blog/posts/[slug].js', '/blog/posts/:slug'],
    ['src/pages/blog/posts/[slug]/comments.js', '/blog/posts/:slug/comments'],
    ['src/pages/categories/[...category].jsx', '/categories/*'],
    ['src/pages/categories/[...category]/foo.jsx', '/categories/*/foo'],
  ];

  it.each(parameters)(`given '%s' then return '%s'`, (filepath, path) => {
    expect(getPathFromSourcepath(filepath)).toBe(path);
  });
});

describe('getFilenameFromSourcepath', () => {
  const parameters: [string, Record<string, string | string[]>, string][] = [
    ['src/pages/index.tsx', {}, '/index'],
    ['othergiberish/src/pages/index.tsx', {}, '/index'],
    ['../src/pages/index.tsx', {}, '/index'],
    ['src/pages/index/index.tsx', {}, '/index/index'],
    ['src/pages/blog.ts', {}, '/blog/index'],
    ['src/pages/blog/posts/[slug].js', { slug: 'first-post' }, '/blog/posts/first-post/index'],
    [
      'src/pages/blog/posts/[slug]/comments.js',
      { slug: 'first-post' },
      '/blog/posts/first-post/comments/index',
    ],
    [
      'src/pages/categories/[...category].jsx',
      { category: ['foo', 'bar'] },
      '/categories/foo/bar/index',
    ],
    [
      'src/pages/categories/[...category]/foo.jsx',
      { category: ['foo', 'bar'] },
      '/categories/foo/bar/foo/index',
    ],
  ];

  it.each(parameters)(`given '%s' with params '%s', then return '%s'`, (path, params, filepath) => {
    expect(getFilenameFromSourcepath(path, params)).toBe(filepath);
  });

  it(`should add the extension if provided`, () => {
    expect(getFilenameFromSourcepath('src/pages/index.tsx', {}, '.html')).toBe('/index.html');
  });
});
