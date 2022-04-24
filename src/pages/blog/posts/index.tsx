import { Link } from '@generator/router';

export default function Posts() {
  return (
    <div>
      <h1>List of Posts</h1>
      <ul>
        <li>
          <Link to="/blog/posts/first-post">First Post</Link>
        </li>
        <li>
          <Link to="/blog/posts/second-post">Second Post</Link>
        </li>
      </ul>
    </div>
  );
}
