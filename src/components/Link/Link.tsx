import { forwardRef, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { To, useHref, useLinkClickHandler } from 'react-router-dom';

interface LinkProps {
  to: To;
  replace?: boolean;
  target?: HTMLAttributeAnchorTarget;
  state?: any;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace = false, target, children, state }, ref) => {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, { replace, target, state });

    return (
      <a ref={ref} href={href} onClick={handleClick}>
        {children}
      </a>
    );
  }
);
