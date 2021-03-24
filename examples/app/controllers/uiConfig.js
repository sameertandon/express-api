
class UiConfig {

    static validateGetUiConfig(ctx) {
        // read from cache
        return {status: 'error'}
    }

    static async getUIConfig(ctx) {
        // read from cache
        return {status: 'UP'}
    }
    static async setUIConfig(ctx) {
        // read from cache
        return {body: ctx.req.body, query: ctx.req.query}
    }
}

module.exports = UiConfig
