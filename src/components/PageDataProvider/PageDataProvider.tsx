import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageDataContext = createContext<{ staticProps: any; loadData(href: string): void }>({
  staticProps: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadData() {},
});

export const usePageData = () => useContext(PageDataContext);

interface PageDataProviderProps {
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProps: any;
}

export function PageDataProvider({ children, initialProps }: PageDataProviderProps) {
  const { pathname } = useLocation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pageDataCache, setPageDataCache] = useState<Record<string, any>>({
    [pathname]: initialProps,
  });

  const staticProps = pageDataCache[pathname] ?? null;

  const loadData = useCallback(
    (href: string) => {
      if (pageDataCache[href] === undefined) {
        getStaticProps(href).then((props) => {
          setPageDataCache({ ...pageDataCache, [href]: props });
        });
      }
    },
    [pageDataCache]
  );

  const context = useMemo(() => {
    return { staticProps, loadData };
  }, [loadData, staticProps]);

  useEffect(() => {
    loadData(pathname);
  }, [pathname, loadData]);

  return <PageDataContext.Provider value={context}>{children}</PageDataContext.Provider>;
}

async function getStaticProps(href: string) {
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
