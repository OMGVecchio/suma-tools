const { CacheManager } = require('./cache')

class BaseTranslator {
  constructor(options = {}) {
    this.defaultSourceLanguage = options.defaultSourceLanguage ?? this.defaultSourceLanguage
    this.defaultTargetLanguage = options.defaultTargetLanguage ?? this.defaultTargetLanguage
    this.cacheManager = new CacheManager({
      output: options.output,
    })
  }

  /**
   * 获取语言映射，例如：zh => zhXXX
   * 不同平台的 lang 可能不一致，提供一个修改映射的接口
   * 默认跟传入的相同
   */
  getLanguage = (lang) => {
    return lang
  }

  /** 默认源语言 */
  defaultSourceLanguage = 'zh'

  /** 默认目标语言 */
  defaultTargetLanguage = 'en'

  /** 切换默认源语言 */
  setSourceLanguage = (lang) => {
    if (!lang) {
      return
    }
    this.defaultSourceLanguage = lang
  }

  /** 切换默认目标语言 */
  setTargetLanguage = (lang) => {
    if (!lang) {
      return
    }
    this.defaultTargetLanguage = lang
  }

  /** 获取源语言 */
  getSourceLanguage = (lang = this.defaultSourceLanguage) => {
    return this.getLanguage(lang)
  }

  /** 获取目标语言 */
  getTargetLanguage = (lang = this.defaultTargetLanguage) => {
    return this.getLanguage(lang)
  }

  /**
   * 单次查询的最大数据条数
   * 查询平台一般会限制单词查询的最大 token 数，例如百度最大支持单次 5000 token
   */
  peerWordsCount = 50

  /**
   * source 转数组
   */
  getSources = (sources) => {
    if (typeof sources === 'string') {
      return [sources]
    }
    if (sources instanceof Set) {
      return Array.from(sources)
    }
    if (sources instanceof Array) {
      return sources
    }
    return []
  }

  /**
   * source 转数组
   */
  getGroups = async (sources, targetLanguage) => {
    const sourcesWithFilter = await this.cacheManager.useCache(targetLanguage, sources)
    const sourcesFormat = this.getSources(sourcesWithFilter)
    const sourceGroup = []
    while (sourcesFormat.length) {
      sourceGroup.push(sourcesFormat.splice(0, this.peerWordsCount))
    }
    return sourceGroup
  }

  /**
   * 对外提供的编译接口
   */
  translate = async (
    sources,
    { sourceLanguage = this.defaultSourceLanguage, targetLanguage = this.defaultTargetLanguage } = {}
  ) => {
    const sourceGroup = await this.getGroups(sources, targetLanguage)
    if (sourceGroup.length === 0) {
      return
    }
    const options = {
      sourceLanguage: this.getLanguage(sourceLanguage),
      targetLanguage: this.getLanguage(targetLanguage),
    }
    try {
      const results = await Promise.allSettled(
        sourceGroup.map((groupSource) => this.dispatchWrapper(groupSource, options))
      )
      const resultJSON = {}
      let failedSources = []
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          Object.keys(result.value).forEach(
            (key) =>
              (result.value[key] = result.value[key].replaceAll(/[@{}|]/g, (char) => {
                return `{'${char}'}`
              }))
          )
          Object.assign(resultJSON, result.value)
        } else {
          failedSources = failedSources.concat(result.reason)
        }
      })
      this.cacheManager.setCache(targetLanguage, resultJSON)
      if (failedSources.length) {
        this.cacheManager.recordErrors(failedSources)
      }
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * dispatch 包装层，处理一些公共逻辑
   */
  dispatchWrapper = async (...allProps) => {
    try {
      const result = await this.dispatch(...allProps)
      return result
    } catch (err) {
      console.error(err)
      return Promise.reject(allProps[0])
    }
  }

  /**
   * 编译接口分发进行，由各个 Translator 自行实现
   */
  dispatch = async (_sources, _options) => {
    return Promise.resolve({})
  }
}

module.exports = BaseTranslator
