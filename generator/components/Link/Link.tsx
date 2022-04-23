import { usePreload } from '@generator/components/PageDataCache';
import { forwardRef, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { To, useHref, useLinkClickHandler } from 'react-router-dom';
import { usePageTransition } from '../PageTransitionProvider/PageTransitionProvider';

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
        }}
      >
        {children}
      </a>
    );
  }
);
