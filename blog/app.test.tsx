import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import App from './app';

describe('<App />', () => {
  it('should render the app', () => {
    render(
      <HelmetProvider>
        <App initialProps={{}} Component={() => null} />
      </HelmetProvider>
    );

    expect(document.querySelector('#App')).toBeInTheDocument();
  });

  it('should render the metadata', async () => {
    render(
      <HelmetProvider>
        <App initialProps={{}} Component={() => null} />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(document.title).toBe('React App');
    });
  });
});
