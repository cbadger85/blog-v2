import { FC } from 'react';
// import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { PageProps } from 'routes';
// import { loadStaticProps } from 'client/loadStaticProps';
import { useQueryPageData } from 'components/PageDataCache/PageDataCache';

interface PageDataProps {
  component: FC<PageProps<unknown>>;
  // initialProps: unknown;
}

export function Page({ component: Component /* , initialProps */ }: PageDataProps) {
  const { pathname } = useLocation();
  // const { data } = useQuery([pathname], () => loadStaticProps(pathname), {
  //   initialData: initialProps,
  // });

  const data = useQueryPageData(pathname);

  return <Component staticProps={data} />;
}
