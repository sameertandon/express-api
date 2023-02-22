class Info {
  static async getInfo (ctx) {
    return { code: 200, name: 'getInfo' }
  }

  static async postInfo (ctx) {
    return { code: 200, name: 'postInfo' }
  }
}

module.exports = Info
