import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const createDir = (importUrl: string) => {
  const dir = dirname(fileURLToPath(importUrl))
  return (...filePath: string[]) => {
    return resolve(dir, ...filePath)
  }
}

export const getFilePath = (importUrl: string, ...filePath: string[]) => {
  createDir(importUrl)(...filePath)
}
