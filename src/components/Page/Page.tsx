import { FC } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { PageProps } from 'routes';
import { loadStaticProps } from 'client/loadStaticProps';

interface PageDataProps {
  component: FC<PageProps<unknown>>;
  initialProps: unknown;
}

export function Page({ component: Component, initialProps }: PageDataProps) {
  const { pathname } = useLocation();
  const { data } = useQuery([pathname], () => loadStaticProps(pathname), {
    initialData: initialProps,
  });

  return <Component staticProps={data} />;
}
