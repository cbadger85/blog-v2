import type { Plugin } from 'vite';
import dev from './dev';
import build from './build';
import config from './config';
import markdown from './markdown';

export default function ssg(): Plugin[] {
  return [config(), markdown(), dev(), build()];
}
