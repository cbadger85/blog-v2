import type { Plugin } from 'vite';
import dev from './dev';
import build from './build';

export default function ssg(): Plugin[] {
  return [dev(), build()];
}
