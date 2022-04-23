import { useQueryPageData } from '@generator/components/PageDataCache';
import { PageProps } from '@generator/types';
import { ComponentClass, ComponentType, FC, LazyExoticComponent } from 'react';
import { useLocation } from 'react-router-dom';

interface PageDataProps {
  component:
    | LazyExoticComponent<ComponentType<PageProps<unknown>>>
    | FC<PageProps<unknown>>
    | ComponentClass<PageProps<unknown>>;
}

export function Page({ component: Component }: PageDataProps) {
  const { pathname } = useLocation();
  const data = useQueryPageData()(pathname);

  return <Component staticProps={data} />;
}
