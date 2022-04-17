import axios from 'axios';
import { forwardRef, ReactNode, useState } from 'react';
import { To, useHref, useNavigate } from 'react-router-dom';

interface LinkProps {
  to: To;
  replace?: boolean;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace = false, children }, ref) => {
    const href = useHref(to);
    const navigate = useNavigate();

    const [state, setState] = useState<Promise<any>>();

    return (
      <a
        ref={ref}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          state?.then((data) => {
            navigate(to, {
              replace,
              state: data,
            });
          });
        }}
        onMouseEnter={() => {
          setState(getStaticProps(href));
        }}
      >
        {children}
      </a>
    );
  }
);

async function getStaticProps(href: string) {
  return axios
    .get(`${href === '/' ? 'home' : href}.json`)
    .then((res) => res.data)
    .catch((e) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      return {};
    });
}
