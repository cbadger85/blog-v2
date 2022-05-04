import { WriteStream } from 'fs';
import type { render } from '@blog/core/server';

type RenderFn = typeof render;

export function mergeStreams(stream: WriteStream, template: string, renderFn: RenderFn) {}
