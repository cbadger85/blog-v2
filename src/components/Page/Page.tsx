import { usePageData } from 'components/PageDataProvider/PageDataProvider';
import { FC } from 'react';
import { PageProps } from 'routes';

interface PageDataProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: FC<PageProps<any>>;
}

export function Page({ component: Component }: PageDataProps) {
  const { staticProps } = usePageData();

  return staticProps === null ? null : <Component staticProps={staticProps} />;
}
