import { usePageTransition } from './components/PageTransitionProvider';

export { type LinkProps, Link } from './components/Link';

export const useIsPageTransitionPending = () => usePageTransition()[0];
