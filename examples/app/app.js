const express = require('express')
const ExpressRouter = require('./../../dist/index').router
const options = {
    validation: true,
    openApi3Spec: "./examples/app/openAPI3_spec.json",
    controllers: './examples/app/controllers'
}
let router = new ExpressRouter(options)
class Application {

    static async run(app) {
        try {
            app.use(express.json())
            app.use(router.getBasePath(), router.getRouter())
            app.use((req,res) => {
                res.status(404).end('error')
            })
            app.use(async (req, res) => {
                res.body = 'Hello World'
            })
            router.on('error', ({err, req}) => {console.log({err,  url: req.url,
                method: req.method,
                body: req.body,
                query: req.query
            })})
            return app.listen(process.env.PORT || 3008)
        } catch (err) {
             // eslint-disable-line
            console.log(err)
        }
    }
}
module.exports = Application
