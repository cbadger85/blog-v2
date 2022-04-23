export { isTruthy, hasOwnProperty } from '@generator/utils/typeGuards';

export { getPathFromSourcepath, getFilenameFromSourcepath } from '@generator/utils/routeUtils';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export async function sleep(time = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
