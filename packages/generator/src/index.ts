import type { Plugin } from 'vite';
import dev from './dev';
import build from './build';
import config from './config';

export default function ssg(): Plugin[] {
  return [config(), dev(), build()];
}
