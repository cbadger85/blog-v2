import { useQueryPageData } from 'components/PageDataCache/PageDataCache';
import { ComponentClass, ComponentType, FC, LazyExoticComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { PageProps } from 'routes';

interface PageDataProps {
  component:
    | LazyExoticComponent<ComponentType<PageProps<unknown>>>
    | FC<PageProps<unknown>>
    | ComponentClass<PageProps<unknown>>;
}

export function Page({ component: Component }: PageDataProps) {
  const { pathname } = useLocation();

  const data = useQueryPageData(pathname);

  return <Component staticProps={data} />;
}
