import { resolve } from 'node:path'
import { babelI18NPlugin } from './babel-plugin'
import { WebpackAutoI18nPlugin } from './webpack-plugin'
import shared from './shared'

const babelI18NPluginPath = resolve(__dirname, './babel-plugin')

export { babelI18NPlugin, babelI18NPluginPath, WebpackAutoI18nPlugin, shared }
