export function getPathFromSourcepath(sourcePath: string): string {
  const path = sourcePath
    .replace(/\.(tsx|ts|jsx|js)/, '')
    .replace(/\/src\/pages/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1');

  return path || '/';
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
