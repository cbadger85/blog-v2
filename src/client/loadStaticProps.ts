import axios from 'axios';

export async function loadStaticProps(href: string) {
  return axios
    .get(`${href === '/' ? 'home' : href}.json`)
    .then((res) => {
      const contentType = res.headers['content-type'];

      if (!contentType || !contentType.includes('application/json')) {
        return {};
      }

      return res.data;
    })
    .catch((e) => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      return {};
    });
}
