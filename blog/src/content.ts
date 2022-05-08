function slugFromFilepath(filepath: string) {
  return filepath.replace('/content/posts/', '').replace('/index.md', '');
}

export function getPosts() {
  const posts = import.meta.glob('/content/posts/**/*.md');

  return Object.keys(posts).map(slugFromFilepath);
}
