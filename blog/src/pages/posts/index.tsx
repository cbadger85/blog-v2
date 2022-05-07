import { Link, FromStaticProps } from '@blog/core';

export async function getStaticProps() {
  const { getPosts } = await import('../../content');
  const posts = await getPosts();
  return { slugs: Object.keys(posts) };
}

export default function Posts({ slugs }: FromStaticProps<typeof getStaticProps>) {
  return (
    <div>
      <h1>List of Posts</h1>
      <ul>
        {slugs.map((slug) => (
          <li key={slug}>
            <Link to={`/posts/${slug}`}>{slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
