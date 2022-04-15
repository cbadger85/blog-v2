import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

async function main() {
  const container = document.getElementById('root');

  if (container) {
    hydrateRoot(
      container,
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
}

main();
