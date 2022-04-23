export { isTruthy, hasOwnProperty } from '@generator/utils/typeGuards';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export async function wait(time = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
