const tencentcloud = require('tencentcloud-sdk-nodejs-tmt')
const BaseTranslator = require('../base')
const { secretId, secretKey, region } = require('./config')
const TmtClient = tencentcloud.tmt.v20180321.Client

class TencentTranslator extends BaseTranslator {
  constructor() {
    super()
    this.clientConfig = {
      credential: {
        secretId,
        secretKey,
      },
      region,
      profile: {
        httpProfile: {
          endpoint: 'tmt.tencentcloudapi.com',
        },
      },
    }
    this.client = new TmtClient(this.clientConfig)
  }

  dispatch = async (sources, { sourceLanguage, targetLanguage }) => {
    const params = {
      Source: sourceLanguage,
      Target: targetLanguage,
      ProjectId: 0,
      SourceTextList: sources,
    }

    const { TargetTextList = [] } = await this.client.TextTranslateBatch(params)
    return sources.reduce((total, source, index) => {
      total[source] = TargetTextList[index]
      return total
    }, {})
  }
}

module.exports = TencentTranslator
