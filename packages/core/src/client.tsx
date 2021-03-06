import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/App';
import { PageTransitionProvider } from './components/PageTransitionProvider';
import config from './config';

export async function main() {
  const container = document.getElementById('root');

  const preloadedData = window.__PRELOADED_DATA__;
  const initialProps = window.__INITIAL_PROPS__;

  if (container) {
    hydrateRoot(
      container,
      <StrictMode>
        <HelmetProvider>
          <BrowserRouter>
            <PageTransitionProvider>
              {config.AppComponent ? (
                <config.AppComponent
                  Component={App}
                  initialProps={initialProps}
                  preloadedData={preloadedData}
                />
              ) : (
                <App initialProps={initialProps} />
              )}
            </PageTransitionProvider>
          </BrowserRouter>
        </HelmetProvider>
      </StrictMode>,
    );
  }
}
