import { ComponentClass, ComponentType, FC, LazyExoticComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryPageData } from '../PageDataCache';

interface PageDataProps {
  component: LazyExoticComponent<ComponentType<unknown>> | FC<unknown> | ComponentClass<unknown>;
}

export function Page({ component: Component }: PageDataProps) {
  const { pathname } = useLocation();

  const { data, status } = useQueryPageData(pathname);

  if (typeof data === 'object' && data) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Component {...data} />;
  }

  if (status === 'LOADING') {
    return null;
  }

  return <Component />;
}
