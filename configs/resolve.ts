import { createDir } from '../utils/path'

import type { AliasOptions } from 'vite'

const __dir = createDir(import.meta.url)

export const alias: AliasOptions = [
  {
    find: '@',
    replacement: __dir('../packages'),
  },
  {
    find: 'ExpiringLocalStorage',
    replacement: __dir('../packages/ExpiringLocalStorage/src'),
  },
]
