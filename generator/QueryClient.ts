import axios from 'axios';

class PageDataNotFoundError extends Error {
  constructor(private href: string) {
    super(`page data not found at ${href}`);
  }
}

interface PendingCache {
  status: 'PENDING';
  pendingData: Promise<unknown>;
}

interface ErrorCache {
  status: 'ERROR';
  error: unknown;
}

interface SuccessCache {
  status: 'SUCCESS';
  data: unknown;
}

type PageCache = PendingCache | ErrorCache | SuccessCache | undefined;

class QueryClient {
  #cache: Record<string, PageCache> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.#cache[window.location.pathname] = { status: 'SUCCESS', data: window.__INITIAL_PROPS__ };
    }
  }

  #loadData(href: string) {
    const cacheStatus = this.#cache[href]?.status;

    if (['SUCCESS', 'PENDING'].includes(cacheStatus as string)) {
      return;
    }

    const pendingData = loadStaticProps(href)
      .then((data) => {
        // setCache((oldCache) => ({ ...oldCache, [href]: { status: 'SUCCESS', data } }))
        this.#cache[href] = { status: 'SUCCESS', data };
      })
      .catch((error: unknown) => {
        this.#cache[href] = { status: 'ERROR', error };
      });

    this.#cache[href] = { status: 'PENDING', pendingData };
  }

  query(href: string) {
    const currentData = this.#cache[href];

    switch (currentData?.status) {
      case 'ERROR':
        throw currentData.error;
      case 'PENDING':
        throw currentData.pendingData;
      case 'SUCCESS':
        return currentData.data;
      default:
        throw this.#loadData(href);
    }
  }

  preload(href: string) {
    this.#loadData(href);
  }
}

async function loadStaticProps(href: string): Promise<unknown> {
  // await wait(2000);

  return axios
    .get(`${href === '/' ? 'index' : href}.json`)
    .then((res) => {
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        throw new PageDataNotFoundError(href);
      }

      return res.data;
    })
    .catch((e) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      throw new PageDataNotFoundError(href);
    });
}

export const queryClient = new QueryClient();
