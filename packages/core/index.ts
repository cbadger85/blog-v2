import { usePageTransition } from './src/components/PageTransitionProvider';

export { type LinkProps, Link } from './src/components/Link';

export const useIsPageTransitionPending = () => usePageTransition()[0];

export {
  Helmet as Head,
  HelmetProvider as HeadProvider,
  type HelmetProps as HeadProps,
} from 'react-helmet-async';

export type {
  AppProps,
  PagePropsFromStaticProps,
  RouteConfig,
  StaticPropsContext,
} from './src/types';
