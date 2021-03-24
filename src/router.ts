import express from 'express'
import _ from 'lodash'
import OpenApi3Util from './utils/openApi3SpecUtil'
import fs from 'fs'
import EventEmitter from 'events'

let router = express.Router()

const _bindPath2Routes = (routesConfig, controllerPath, self) => {
    // Create a separate router for each parent route in json
    let controllers = _getControllers(controllerPath)
    let routeMap = routesConfig
    for (const pathkey in routeMap) {
        let route = routeMap[pathkey]
        for (const methodkey in route) {
            router[methodkey](route[methodkey].path,
                _bindController2Router(controllers, route[methodkey], self))
        }
    }
}

const _getControllers = (controllerPath) => {
    let controllers = {}
    fs.readdirSync(controllerPath).forEach((file) => {
        if(file.endsWith('.js') && !file.endsWith('.validator.js')) {
            const fileName = file.replace('.js', '')
            let reqValidator
            const validatorFilePath = `${controllerPath}/${fileName}.validator.js`
            if (fileName === 'controller') {
                return
            }
            let instance = require(controllerPath + '/' + fileName)
            // If a req validator file is added to the controller then load is for execution
            if(fs.existsSync(validatorFilePath)) {
              reqValidator = require(validatorFilePath)
            }
            controllers[fileName] = {instance, reqValidator}

        }
    })
    return controllers
}

const _bindController2Router = (controllers, route, self) => {
    return async (req, res) => {
        let ctx = {req, res}
        let errors;
        try {
            let cntrl = controllers[route.controller]
            if(cntrl.reqValidator && cntrl.reqValidator[route.operationId]) {
                errors = await cntrl.reqValidator[route.operationId](ctx.req)
            }
            if(errors) {
              _handleHttpResponse(ctx.res, 422, errors)
            } else {
              let data = await cntrl.instance[route.operationId](ctx)
              if(data && typeof data === 'object') {
                _handleHttpResponse(ctx.res, 200, data)
              }
            }
        } catch (err) {
            self.emit('error', {err, req: ctx.req})
            _handleHttpResponse(ctx.res, 503,
              {msg: 'Service side Error Occured. Please check Error Logs.'})
        }
    }
}

const _handleHttpResponse = (res, code, body) => {
  res.status(code)
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default class Router extends EventEmitter {
    private validation: any
    private openApi3Mgr: any
    private controllerPath: any

    constructor(params = {
        openApi3Spec: './openAPI3Spec.json',
        controllers: './src/controllers',
        validation: undefined
      }) {
        super()
        this.validation = params.validation
        this.openApi3Mgr = new OpenApi3Util(params.openApi3Spec || './openAPI3Spec.json')
        this.controllerPath = fs.realpathSync(params.controllers || './src/controllers')
    }
    getBasePath() {
      return this.openApi3Mgr.getBasePath() || "/"
    }
    getRouter() {
        let self = this
        let middlewares = this.openApi3Mgr.getMiddlewares()
        if(middlewares) {
            for (let middleware of middlewares) {
                let objMiddleware = middleware.module
                if (middleware.operation) {
                    router.use(objMiddleware[middleware.operation](middleware.params))
                } else {
                    router.use(objMiddleware(middleware.params))
                }
            }
        }
        // load routers and bind them to controllers
        _bindPath2Routes(this.openApi3Mgr.loadRoutesConfig(), this.controllerPath, self)
        return router
    }
}
