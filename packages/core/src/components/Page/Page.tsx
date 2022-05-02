import { ComponentClass, ComponentType, FC, LazyExoticComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryPageData } from '../PageDataCache';

interface PageDataProps {
  component: LazyExoticComponent<ComponentType<unknown>> | FC<unknown> | ComponentClass<unknown>;
}

export function Page({ component: Component }: PageDataProps) {
  const { pathname } = useLocation();
  const data = useQueryPageData()(pathname);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return typeof data === 'object' && data ? <Component {...data} /> : <Component />;
}
