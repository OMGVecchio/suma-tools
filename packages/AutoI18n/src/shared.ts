const cacheFile = require('./i18n.json')

// 避免频繁改变文件中的属性位置
const i18nWordSet = new Set(Object.keys(cacheFile))

const addWord = (word) => {
  // 避免频繁改变文件中的属性位置
  if (hasWord(value)) {
    return
  }
  return i18nWordSet.add(word)
}

const hasWord = (word) => {
  return i18nWordSet.has(word)
}

const delWord = (word) => {
  return i18nWordSet.delete(word)
}

const getSet = () => {
  return i18nWordSet
}

const clearSet = () => {
  i18nWordSet.clear()
  return i18nWordSet
}

const getJSONString = () => {
  return JSON.stringify(
    Array.from(getSet()).reduce((total, word) => {
      // TODO 因为使用的 vue-i18n，其针对某些字符做了特殊处理，如果想展示该字符，需要加 {'x'} 包裹
      // 例如 @ => {'@'}、{ => {'@'}、} => {'}'}、| => {'|'}
      // 以下处理部分数据
      total[word] = word.replaceAll(/[@{}|]/g, (char) => {
        return `{'${char}'}`
      })
      return total
    }, {}),
    null,
    2
  )
}

module.exports = {
  addWord,
  hasWord,
  delWord,
  getSet,
  clearSet,
  getJSONString,
}
