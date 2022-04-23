import { usePageTransition } from './components/PageTransitionProvider/PageTransitionProvider';

export { type LinkProps, Link } from '@generator/components/Link';

export const useIsPageTransitionPending = () => usePageTransition()[0];
