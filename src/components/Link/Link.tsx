import { usePageData } from 'components/PageDataProvider/PageDataProvider';
import { forwardRef, HTMLAttributeAnchorTarget, ReactNode } from 'react';
import { To, useHref, useLinkClickHandler } from 'react-router-dom';

interface LinkProps {
  to: To;
  replace?: boolean;
  target?: HTMLAttributeAnchorTarget;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace = false, target, children, state }, ref) => {
    const href = useHref(to);
    const handleClick = useLinkClickHandler(to, { replace, target, state });
    const { loadData } = usePageData();

    return (
      <a ref={ref} href={href} onClick={handleClick} onMouseEnter={() => loadData(href)}>
        {children}
      </a>
    );
  }
);
