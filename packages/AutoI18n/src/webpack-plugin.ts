const fs = require('fs/promises')
const { resolve } = require('path')
const { getJSONString } = require('./shared')

const ID = 'WebpackAutoI18nPlugin'
const FILE_NAME = 'i18n.json'

class WebpackAutoI18nPlugin {
  name = ID
  cacheFileName = FILE_NAME
  /** @type {AbortController} */
  writeController
  isWriting = false

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply = (compiler) => {
    compiler.hooks.done.tap(this.name, () => {
      this.saveFile()
    })
  }

  refreshWriteController = () => {
    this.writeController = new AbortController()
  }

  resolveFilePath = () => {
    return resolve(__dirname, this.cacheFileName)
  }

  writeFile = async () => {
    this.refreshWriteController()
    try {
      await fs.writeFile(this.resolveFilePath(), getJSONString(), { signal: this.writeController.signal })
      this.isWriting = false
    } catch (err) {
      // 寻找 NodeJS 中 ABORT_ERR 对应的常量
      if (err.code === 'ABORT_ERR') {
        this.writeFile()
        return
      }
      console.error(err)
      this.isWriting = false
    }
  }

  saveFile = () => {
    if (this.isWriting && this.writeController) {
      this.writeController.abort()
      return
    }
    this.isWriting = true
    this.writeFile()
  }
}

module.exports = {
  WebpackAutoI18nPlugin,
  ID,
  FILE_NAME,
}
