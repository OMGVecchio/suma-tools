const { addWord } = require('./shared')

// 针对不需要国际化的中文字符，末尾增加 @@GIS 做标识
const SPECIAL_TAG = '@@GIS'
const SPECIAL_RegExp = new RegExp(`${SPECIAL_TAG}$`)

// TODO
// 在代码中手动排除了 _createCommentVNode 这种注释中的中文
// 那在代码编译中，还是可能会向 Set 中注入可能会被 TreeShaking 的无效数据？
/**
 * @param {import('@babel/core')} babel
 */
module.exports = {
  babelI18NPlugin: (babel) => {
    const { types } = babel
    return {
      visitor: {
        Literal(path) {
          const { node } = path
          // TODO 过滤或者包含的字段需要通过配置来决定
          const { filename } = path.hub.file.opts
          if (
            !/\\src\\/.test(filename) ||
            /\\src\\i18n\\/.test(filename) ||
            /\\src\\utils\\const\\no-i18n-translation/.test(filename)
          ) {
            return
          }
          // import 中文名的资源时，直接返回
          if (types.isImportDeclaration(path.parent)) {
            return
          }
          // TODO 排除的字段需要通过配置来决定
          // 以下如果执行了 path.replaceWithSourceString(`$t(${raw})`) 代码
          // AST 应该会立马更新，然后无限循环： $t('测试') => $t($t('测试')) => $t($t($t('测试'))) ....
          // 所以在此处跳出循环（应该也能在 path.replaceWithSourceString 执行前做判断，但此处的逻辑更靠前，应该会更快）
          // _createCommentVNode：注释里的中文不做处理
          if (types.isCallExpression(path.parent) && ['$t', '_createCommentVNode'].includes(path.parent.callee.name)) {
            return
          }
          if (!types.isStringLiteral(node)) {
            return
          }
          // 原始数据有两种情况，适用于不同情况，类似 webpack.define 里用到的 JSON.stringify
          // raw   序列化后的数据          name => '"name"'
          // value 未序列化的JS数据类型    name => 'name'
          const { extra: { raw } = {}, value } = node
          if (!raw) {
            return
          }
          if (/[\u4e00-\u9fa5]/.test(raw)) {
            // 部分情况下的中文，不能够做替换
            // 例如传参里的 "12px 微软雅黑"
            // 所以针对以特定字符结尾的字符串，不进行国际化编译，同时把特殊标识去除
            if (SPECIAL_RegExp.test(value)) {
              path.replaceWithSourceString(raw.replace(SPECIAL_TAG, ''))
              return
            }
            // 针对 JSX 文件，将静态字符串属性转化成动态函数调用
            if (types.isJSXAttribute(path.parent)) {
              path.replaceWith(
                types.jSXExpressionContainer(types.callExpression(types.identifier('$t'), [types.stringLiteral(value)]))
              )
              return
            }
            // 字符串直接替换为函数调用
            path.replaceWithSourceString(`$t(${raw})`)
            addWord(value)
          }
        },
      },
    }
  },
}
