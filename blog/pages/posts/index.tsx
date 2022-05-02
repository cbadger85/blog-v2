import { Link } from '@blog/core/router';

export default function Posts() {
  return (
    <div>
      <h1>List of Posts</h1>
      <ul>
        <li>
          <Link to="/posts/first-post">First Post</Link>
        </li>
        <li>
          <Link to="/posts/second-post">Second Post</Link>
        </li>
      </ul>
    </div>
  );
}
