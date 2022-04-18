import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface PageDataProviderProps {
  children: (activePageData: any) => ReactNode;
  initialProps: any;
}

export function PageDataProvider({ children, initialProps }: PageDataProviderProps) {
  const { pathname } = useLocation();

  const [pageDataCache, setPageDataCache] = useState<Record<string, any>>({
    [pathname]: initialProps,
  });
  const activePageData = pageDataCache[pathname] ?? null;

  useEffect(() => {
    if (activePageData === null) {
      getStaticProps(pathname).then((props) => {
        setPageDataCache((cache) => ({ ...cache, [pathname]: props }));
      });
    }
  }, [pathname, activePageData]);

  return <>{children({ activePageData })}</>;
}

async function getStaticProps(href: string) {
  return axios
    .get(`${href === '/' ? 'home' : href}.json`)
    .then((res) => {
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        return {};
      }

      console.log(res.data);

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
