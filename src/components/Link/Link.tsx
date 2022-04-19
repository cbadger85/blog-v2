// import { loadStaticProps } from 'client/loadStaticProps';
import { usePreload } from 'components/PageDataCache/PageDataCache';
import { forwardRef, HTMLAttributeAnchorTarget, ReactNode } from 'react';
// import { useQueryClient } from 'react-query';
import { To, useHref, useLinkClickHandler } from 'react-router-dom';

interface LinkProps {
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
    // const queryClient = useQueryClient();

    const preload = usePreload();

    return (
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseEnter={() => {
          // queryClient.prefetchQuery([href], () => loadStaticProps(href));
          preload(href);
        }}
      >
        {children}
      </a>
    );
  }
);
