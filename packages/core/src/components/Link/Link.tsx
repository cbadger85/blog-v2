import { forwardRef, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { matchRoutes, To, useHref, useLinkClickHandler } from 'react-router-dom';
import config from '../../config';
import { RouteConfig } from '../../types';
import { usePreload } from '../PageDataCache';
import { usePageTransition } from '../PageTransitionProvider';

export function loadModuleFromPathname(
  _routes: RouteConfig[],
  pathname: string,
): Promise<Record<string, unknown>> {
  const firstMatch = matchRoutes(_routes, pathname)?.[0];

  return (firstMatch?.route as RouteConfig)?.loadComponent();
}

export interface LinkProps {
  to: To;
  replace?: boolean;
  target?: HTMLAttributeAnchorTarget;
  state?: unknown;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace = false, target, children, state }, ref) => {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, { replace, target, state });
    const [_, startTransition] = usePageTransition();

    const preload = usePreload();

    return (
      <a
        ref={ref}
        href={href}
        onClick={(e) => {
          startTransition(() => {
            handleClick(e);
          });
        }}
        onMouseEnter={() => {
          preload(href);
          loadModuleFromPathname(config.routes, href);
        }}
      >
        {children}
      </a>
    );
  },
);
