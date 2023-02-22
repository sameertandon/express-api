
class AppConfigSamDoc {
  static async setAppConfig (ctx) {
    return { body: ctx.request.body, params: ctx.params }
  }
}

module.exports = AppConfigSamDoc
