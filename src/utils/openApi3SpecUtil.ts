import fs from "fs"
import _ from "lodash"

export default class OpenApi3SpecUtil {
    private openapiDoc: any
    constructor(path) {
        this.openapiDoc = require(fs.realpathSync(path))
    }

    public buildcontrollers(methodNode, path) {
        let ctrlPath = methodNode["x-express-controller"]
        if (!ctrlPath) {
            ctrlPath = path.replace(/\//g, " ").replace(/{/g, "").replace(/}/g, "")
        }
        return _.camelCase(ctrlPath)
    }

    public buildOpenapi2RouterPath(path) {
        return path.replace(/{/g, ":")
            .replace(/}/g, "")
    }

    public loadRoutesConfig() {
        const routes = {}
        const paths = this.openapiDoc.paths

        for (const path in paths) { // tslint:disable-line
            const pathNode = paths[path]
            for (const method in pathNode) { // tslint:disable-line
                const methodNode = pathNode[method]
                const routeConfig = { controller: this.buildcontrollers(methodNode, path),
                    method,
                    operationId: methodNode.operationId,
                    parameters: methodNode.parameters,
                    path: this.buildOpenapi2RouterPath(path)}
                routes[path] = routes[path] || []
                routes[path][method] = routeConfig
            }
        }
        return routes
    }

    public getMiddlewares() {
        const middlewaresConfig = []
        const middlewares = this.openapiDoc["x-express-middlewares"]

        if (middlewares) {
            for (const middleware in middlewares) { // tslint:disable-line
                try {
                    let path = middleware
                    let operation
                    if (middleware.indexOf(".") > 2) {
                        const arrPath = middleware.split(".")
                        path = arrPath[0]
                        operation = arrPath[1]
                    }
                    if (middleware.startsWith("./")) {
                        path = fs.realpathSync(middleware.substring(2))
                    }
                    const config = {
                        module: require(path),
                        operation,
                        params: middlewares[middleware],
                    }
                    middlewaresConfig.push(config)
                } catch (err) {

                  throw new Error(`OpenAPISpec-Router: Error loading the "${middleware}" using require. ` +
                        `Please check if the module is configured correctly for loading:`)
                }
            }
        }
        return middlewaresConfig
    }

    public getBasePath() {
        return _.get(this.openapiDoc, "servers[0].variables.basePath.default")
    }
}
