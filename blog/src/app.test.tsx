import { render, waitFor } from '@testing-library/react';
import { HeadProvider } from '@blog/core';
import App from './app';

describe('<App />', () => {
  it('should render the app', () => {
    render(
      <HeadProvider>
        <App initialProps={{}} Component={() => null} />
      </HeadProvider>,
    );

    expect(document.querySelector('#App')).toBeInTheDocument();
  });

  it('should render the metadata', async () => {
    render(
      <HeadProvider>
        <App initialProps={{}} Component={() => null} />
      </HeadProvider>,
    );

    await waitFor(() => {
      expect(document.title).toBe('React App');
    });
  });
});
