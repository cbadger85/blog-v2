import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { noop } from '@generator/utils';

const PageDataCacheContext = createContext<{
  preload: (href: string) => void;
  queryPageData: (href: string) => unknown;
}>({
  preload: noop,
  queryPageData: noop,
});

export function useQueryPageData(): (href: string) => unknown {
  return useContext(PageDataCacheContext).queryPageData;
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

type PageCache = PendingCache | ErrorCache | SuccessCache | undefined;

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
          setCache((oldCache) => ({ ...oldCache, [href]: { status: 'SUCCESS', data } }))
        )
        .catch((error: unknown) =>
          setCache((oldCache) => ({ ...oldCache, [href]: { status: 'ERROR', error } }))
        );

      setCache((oldCache) => ({ ...oldCache, [href]: { status: 'PENDING', pendingData } }));
    },
    [cache]
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
    [cache, loadData]
  );

  const context = useMemo(
    () => ({
      queryPageData,
      preload: loadData,
    }),
    [loadData, queryPageData]
  );

  return <PageDataCacheContext.Provider value={context}>{children}</PageDataCacheContext.Provider>;
}

class PageDataNotFoundError extends Error {
  constructor(private href: string) {
    super(`page data not found at ${href}`);
  }
}

async function loadStaticProps(href: string): Promise<unknown> {
  return axios
    .get(`${href === '/' ? 'index' : href}.json`)
    .then((res) => {
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        throw new PageDataNotFoundError(href);
      }

      return res.data;
    })
    .catch((e) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      return {};
    });
}
