import { createContext, ReactNode, startTransition, useContext, useTransition } from 'react';

const PageTransitionContext = createContext<[boolean, (cb: () => void) => void]>([
  false,
  startTransition,
]);

export const usePageTransition = () => useContext(PageTransitionContext);

interface PageTransitionProviderProps {
  children?: ReactNode;
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const transition = useTransition();

  return (
    <PageTransitionContext.Provider value={transition}>{children}</PageTransitionContext.Provider>
  );
}
