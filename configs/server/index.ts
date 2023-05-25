import { readFileSync } from 'node:fs'
import { createDir } from '../../utils/path'

import type { ServerOptions } from 'vite'

const __dir = createDir(import.meta.url)

export const server: ServerOptions = {
  host: '127.0.0.1',
  port: 8000,
  https: {
    cert: readFileSync(__dir('./keys/127.0.0.1.cert')),
    key: readFileSync(__dir('./keys/127.0.0.1.key')),
  },
}
