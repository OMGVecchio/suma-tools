const fs = require('node:fs/promises')
const { resolve } = require('node:path')
const defaultCacheRoot = resolve(__dirname, '../.cache')
const { ERROR_FILENAME } = require('./config')

/**
 * TODO
 * open 取代 access 然后写入，速度可能会更快
 * 但是 open 的 mode 有 w/r
 * 现在是需要读取的时候用 r，需要写入的时候后用 w，速度或许会被 wr 一起更快？
 * 但是在需要又读又写的时候，肯定是 wr 会更好，毕竟只需要接入一次？
 * 所以需要考虑如何组织 open 的逻辑
 */
class CacheManager {
  constructor(options = {}) {
    this.cacheRoot = options.output?.path ?? defaultCacheRoot
  }

  getFilePath = (lang) => {
    return resolve(this.cacheRoot, lang)
  }

  getFileFd = async (lang, mode) => {
    if (!lang.endsWith('.json')) {
      lang += '.json'
    }
    try {
      const fd = await fs.open(this.getFilePath(lang), mode)
      return fd
    } catch (err) {
      console.error(err)
    }
  }

  readJSON = async (lang) => {
    try {
      const fd = await this.getFileFd(lang, 'r+')
      if (!fd) {
        return ''
      }
      const buffer = await fd.readFile()
      return JSON.parse(buffer.toString())
    } catch (err) {
      console.error(err)
      return Promise.resolve({})
    }
  }

  writeJSON = async (lang, data) => {
    try {
      const fd = await this.getFileFd(lang, 'w+')
      await fd.writeFile(JSON.stringify(data))
    } catch (err) {
      console.error(err)
    }
  }

  useCache = async (lang, sources) => {
    const cacheData = await this.readJSON(lang)
    return sources.filter((source) => !cacheData[source])
  }

  setCache = async (lang, sourceMap) => {
    const cacheData = await this.readJSON(lang)
    Object.assign(cacheData, sourceMap)
    await this.writeJSON(lang, cacheData)
  }

  clearCache = async (lang) => {
    await this.writeJSON(lang, {})
  }

  recordErrors = async (failedSources) => {
    await this.writeJSON(ERROR_FILENAME, failedSources)
  }
}

module.exports = {
  CacheManager,
}
