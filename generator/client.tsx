import { FC, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@generator/components/App';
import { AppProps } from '@generator/types';

const CustomApp: FC<AppProps> | undefined = Object.values(
  import.meta.globEager('@app/app.(tsx|ts|jsx|js)')
)[0]?.default;

async function main() {
  const container = document.getElementById('root');

  const preloadedData = window.__PRELOADED_DATA__;
  const initialProps = window.__INITIAL_PROPS__;

  if (container) {
    hydrateRoot(
      container,
      <StrictMode>
        <HelmetProvider>
          <BrowserRouter>
            {CustomApp ? (
              <CustomApp
                Component={App}
                initialProps={initialProps}
                preloadedData={preloadedData}
              />
            ) : (
              <App initialProps={initialProps} />
            )}
          </BrowserRouter>
        </HelmetProvider>
      </StrictMode>
    );
  }
}

main();
