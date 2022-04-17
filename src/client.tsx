import { Router } from 'components/Router';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

async function main() {
  const container = document.getElementById('root');

  const preloadedData = window.__PRELOADED_DATA__;
  const initialProps = window.__INITIAL_PROPS__;

  if (container) {
    hydrateRoot(
      container,
      <StrictMode>
        <HelmetProvider>
          <Router>
            <App preloadedData={preloadedData} initialProps={initialProps} />
          </Router>
        </HelmetProvider>
      </StrictMode>
    );
  }
}

main();
