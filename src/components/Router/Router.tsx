import { ReactNode, Children, createContext, useContext, ReactElement } from 'react';

const RouterContext = createContext(getCurrentUrl());

interface RouterProps {
  children?: ReactNode;
  location?: string;
}

export function Router({ children, location = getCurrentUrl() }: RouterProps) {
  return <RouterContext.Provider value={location}>{children}</RouterContext.Provider>;
}

function getCurrentUrl(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

interface RoutesProps {
  children?: ReactElement<RouteProps> | ReactElement<RouteProps>[];
  fallback?: ReactNode;
}

export function Routes({ children, fallback }: RoutesProps) {
  const location = useContext(RouterContext);

  const routes = Children.map(children, (child) => (child?.props.path === location ? child : null));

  return <>{routes && Array.isArray(routes) && routes.length ? routes : fallback}</>;
}

interface RouteProps {
  children?: ReactNode;
  // used in the matchRoute fn.
  // eslint-disable-next-line react/no-unused-prop-types
  path: string;
}

export function Route({ children }: RouteProps) {
  return <>{children}</>;
}
