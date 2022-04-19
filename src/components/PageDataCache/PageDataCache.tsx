import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PageDataCacheContext = createContext<{
  preload: (href: string) => void;
  queryPageData: (href: string) => unknown;
}>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  preload() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  queryPageData() {},
});

export function useQueryPageData(href: string): unknown {
  return useContext(PageDataCacheContext).queryPageData(href);
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

  const loadData = useCallback((href: string) => {
    const pendingData = loadStaticProps(href)
      .then((data) =>
        setCache((oldCache) => ({ ...oldCache, [href]: { status: 'SUCCESS', data } }))
      )
      .catch((e: unknown) =>
        setCache((oldCache) => ({ ...oldCache, [href]: { status: 'ERROR', error: e } }))
      );
    setCache((oldCache) => ({ ...oldCache, [href]: { status: 'PENDING', pendingData } }));
  }, []);

  const queryPageData = useCallback(
    (href: string) => {
      const currentData = cache[href];
      switch (currentData?.status) {
        case undefined:
          throw loadData(href);
        case 'ERROR':
          throw currentData.error;
        case 'PENDING':
          throw currentData.pendingData;
        case 'SUCCESS':
          return currentData.data;
        default:
          throw new Error('Invalid cache status');
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

async function loadStaticProps(href: string): Promise<unknown> {
  return axios
    .get(`${href === '/' ? 'home' : href}.json`)
    .then((res) => {
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        return {};
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
