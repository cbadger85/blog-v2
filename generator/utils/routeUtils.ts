export function getPathFromSourcepath(sourcePath: string): string {
  const path = sourcePath
    .replace(/\.(tsx|ts|jsx|js)/, '')
    .replace(/^(.*?)src\/pages/, '')
    .replace(/\/index$/, '')
    .replace(/\[\.{3}.+\]/, '*')
    .replace(/\[(.+)\]/, ':$1');

  return path || '/';
}

export function getFilenameFromSourcepath(
  sourcepath: string,
  params: Record<string, string | string[]>,
  ext = ''
): string {
  return (
    Object.entries(params).reduce(
      (path, [key, param]) => {
        if (Array.isArray(param)) {
          return path.replace(`[...${key}]`, param.join('/'));
        }
        return path.replace(`[${key}]`, param);
      },
      sourcepath
        .replace(/\.(tsx|ts|jsx|js)/, '')
        .replace(/^(.*?)src\/pages/, '')
        .replace(/\/index$/, '')
    ) + `/index${ext}`
  );
}
