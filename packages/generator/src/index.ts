import type { Plugin } from 'vite';
import dev from './dev';
import build from './build';
import config from './config';
import markdown from './markdown';

export default function ssg(): Plugin[] {
  let publicDir: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return [config({ publicDir }), markdown({ clientPublicDir: publicDir }), dev(), build()];
}
