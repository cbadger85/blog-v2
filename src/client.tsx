import { Router } from 'components/Router';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

async function main() {
  const container = document.getElementById('root');

  const context = window.__CONTEXT_DATA__;

  if (container) {
    hydrateRoot(
      container,
      <StrictMode>
        <HelmetProvider>
          <Router>
            <App context={context} />
          </Router>
        </HelmetProvider>
      </StrictMode>
    );
  }
}

main();
