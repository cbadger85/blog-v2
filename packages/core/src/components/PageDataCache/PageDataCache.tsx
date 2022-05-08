import { Action } from 'history';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const PageDataCacheContext = createContext<{
  preload: (href: string) => void;
  queryPageData: (href: string) => unknown;
  getCacheData: (href: string) => PageCache;
  setCacheData: (href: string, pageCache: PageCache) => void;
}>({
  preload: noop,
  queryPageData: noop,
  getCacheData: () => undefined,
  setCacheData: noop,
});

interface PageQueryData {
  data?: unknown;
  status: 'SUCCESS' | 'LOADING';
}

const FROM_POP = Symbol('FROM_POP');

export function useQueryPageData(href: string): PageQueryData {
  const { queryPageData, getCacheData, setCacheData } = useContext(PageDataCacheContext);
  const navigationType = useNavigationType();

  const pageCache = getCacheData(href);

  const suspendedData = navigationType !== Action.Pop ? queryPageData(href) : FROM_POP;

  useEffect(() => {
    if (!pageCache && navigationType === Action.Pop) {
      setCacheData(href, { status: 'LOADING' });
      loadStaticProps(href)
        .then((data) => {
          setCacheData(href, { status: 'SUCCESS', data });
        })
        .catch((error) => setCacheData(href, { status: 'ERROR', error }));
    }
  }, [href, navigationType, pageCache, setCacheData]);

  if (suspendedData !== FROM_POP) {
    return { status: 'SUCCESS', data: suspendedData };
  }

  switch (pageCache?.status) {
    case 'ERROR':
      throw pageCache.error;
    case 'SUCCESS':
      return { status: 'SUCCESS', data: pageCache.data };
    default:
      return { status: 'LOADING' };
  }
}

export const usePreload = () => useContext(PageDataCacheContext).preload;

interface PendingCache {
  status: 'PENDING';
  pendingData: Promise<unknown>;
}

interface ErrorCache {
  status: 'ERROR';
  error: unknown;
}

interface SuccessCache {
  status: 'SUCCESS';
  data: unknown;
}

interface LoadingCache {
  status: 'LOADING';
}

type PageCache = PendingCache | ErrorCache | SuccessCache | LoadingCache | undefined;

interface PageDataCacheProps {
  initialProps: unknown;
  children?: ReactNode;
}

export function PageDataCache({ initialProps, children }: PageDataCacheProps) {
  const { pathname } = useLocation();
  const [cache, setCache] = useState<Record<string, PageCache>>(() => {
    if (initialProps === undefined) {
      return {};
    }

    return { [pathname]: { status: 'SUCCESS', data: initialProps } };
  });

  const loadData = useCallback(
    (href: string) => {
      const cacheStatus = cache[href]?.status;

      if (['SUCCESS', 'PENDING'].includes(cacheStatus as string)) {
        return;
      }

      const pendingData = loadStaticProps(href)
        .then((data) =>
          setCache((oldCache) => ({ ...oldCache, [href]: { status: 'SUCCESS', data } })),
        )
        .catch((error: unknown) =>
          setCache((oldCache) => ({ ...oldCache, [href]: { status: 'ERROR', error } })),
        );

      setCache((oldCache) => ({ ...oldCache, [href]: { status: 'PENDING', pendingData } }));
    },
    [cache],
  );

  const queryPageData = useCallback(
    (href: string) => {
      const currentData = cache[href];

      switch (currentData?.status) {
        case 'ERROR':
          throw currentData.error;
        case 'PENDING':
          throw currentData.pendingData;
        case 'SUCCESS':
          return currentData.data;
        default:
          throw loadData(href);
      }
    },
    [cache, loadData],
  );

  const getCacheData = useCallback((href: string) => cache[href], [cache]);

  const setCacheData = useCallback(
    (href: string, pagCache: PageCache) =>
      setCache((oldCache) => ({ ...oldCache, [href]: pagCache })),
    [],
  );

  const context = useMemo(
    () => ({
      queryPageData,
      preload: loadData,
      getCacheData,
      setCacheData,
    }),
    [loadData, queryPageData, getCacheData, setCacheData],
  );

  return <PageDataCacheContext.Provider value={context}>{children}</PageDataCacheContext.Provider>;
}

async function loadStaticProps(href: string): Promise<unknown> {
  return fetch(`${href === '/' ? '' : href}/index.json`)
    .then((res) => {
      const contentType = res.headers.get('content-type');

      if (!contentType || !contentType.includes('application/json')) {
        return {};
      }

      return res.json();
    })
    .catch(() => ({}));
}
