
class UiRedirect {
    static async getUIRedirect(ctx) {
        ctx.res.redirect('http://googl.com')
    }
}

module.exports = UiRedirect
