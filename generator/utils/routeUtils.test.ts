import { RouteConfig } from '@generator/types';
import { getPathFromSourcepath, getFilenameFromSourcepath, matchRoute } from '@generator/utils';

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

describe.only('matchRoute', () => {
  const config1: RouteConfig = {
    component: vi.fn() as never,
    path: '/',
    sourcepath: '../src/pages/index.tsx',
  };
  const config2: RouteConfig = {
    component: vi.fn() as never,
    path: '/index',
    sourcepath: '../src/pages/index/index.jsx',
  };
  const config3: RouteConfig = {
    component: vi.fn() as never,
    path: '/',
    sourcepath: 'othergiberish/src/pages/index.tsx',
  };
  const config4: RouteConfig = {
    component: vi.fn() as never,
    path: '/blog/posts/:slug',
    sourcepath: 'src/pages/blog/posts/[slug].js',
    getStaticPaths: () => Promise.resolve([{ slug: 'first-post' }, { slug: 'second-post' }]),
  };
  const config5: RouteConfig = {
    component: vi.fn() as never,
    path: '/categories/*',
    sourcepath: 'src/pages/categories/[...category].ts',
    getStaticPaths: () => Promise.resolve([{ category: ['foo', 'bar'] }]),
  };
  const config6: RouteConfig = {
    component: vi.fn() as never,
    path: '/blog/posts/:slug/comments',
    sourcepath: 'src/pages/blog/posts/[slug]/comments.jsx',
    getStaticPaths: () => Promise.resolve([{ slug: 'first-post' }, { slug: 'second-post' }]),
  };
  const config7: RouteConfig = {
    component: vi.fn() as never,
    path: '/categories/*/baz',
    sourcepath: 'src/pages/categories/[...category]/baz.ts',
    getStaticPaths: () => Promise.resolve([{ category: ['foo', 'bar'] }]),
  };
  const config8: RouteConfig = {
    component: vi.fn() as never,
    path: '/pictures/:date/tags/*',
    sourcepath: 'src/pages/pictures/[date]/tags/[...tag].tsx',
    getStaticPaths: () => Promise.resolve([{ date: '2022-04-20', tag: ['foo', 'bar'] }]),
  };
  const parameters: [RouteConfig[], string, RouteConfig | null][] = [
    [[config1, config2, config4, config5], '/', config1],
    [[config1, config2, config4, config5], '/foo', null],
    [[config1, config2, config4, config5], '/index', config2],
    [[config2, config3, config4, config5], '/', config3],
    [[config1, config2, config4, config5], '/blog/posts/first-post', config4],
    [[config1, config2, config4, config5], '/categories/foo/bar', config5],
    [[config1, config2, config5, config6], '/blog/posts/second-post/comments', config6],
    [[config1, config2, config6, config7], '/categories/foo/bar/baz', config7],
    [[config1, config2, config8], '/pictures/2022-04-20/tags/foo/bar', config8],
  ];

  it.each(parameters)(
    `given path '%s' return matching route config`,
    async (routes, path, matchingRoute) => {
      expect(await matchRoute(routes, path)).toEqual(matchingRoute);
    }
  );
});
