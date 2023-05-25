import { createDir } from '../utils/path'

import type { BuildOptions } from 'vite'

const __dir = createDir(import.meta.url)

export const build: BuildOptions = {
  lib: {
    entry: __dir('../packages'),
    formats: ['cjs', 'es', 'umd'],
    name: 'Tools',
    fileName: (format) => `blue-print.${format}.js`,
  },
  outDir: __dir('../dist'),
}
