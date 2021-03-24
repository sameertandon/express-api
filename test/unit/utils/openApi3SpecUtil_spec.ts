import {expect} from "chai"
import OpenApi2SpecUtil from "../../../src/utils/openApi3SpecUtil"

describe("openApi2SpecUtil: utils", () => {
    it("object keys", async () => {
        const keys = Object.keys(OpenApi2SpecUtil)
        expect(keys).to.be.an("Array")
        expect(keys.length).to.equal(0)
    })

    it("With Valid basePath in servers", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const basePath = sut.getBasePath()
        expect(basePath).to.equal("/v1/api")
    })

    it("Convert Openapi to express Router simple Path", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const path = sut.buildOpenapi2RouterPath("/test")
        expect(path).to.equal("/test")
    })

    it("Convert Openapi to express Router parameterd Path", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const path = sut.buildOpenapi2RouterPath("/test/{name}/user/{role}")
        expect(path).to.equal("/test/:name/user/:role")
    })

    it("Build controller Path from open api", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const ctrl = sut.buildcontrollers({}, "/test")
        expect(ctrl).to.equal("test")
    })

    it("Build controller Path from open api extn: x-express-controller", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const ctrl = sut.buildcontrollers({"x-express-controller": "UserController"}, "/user")
        expect(ctrl).to.equal("userController")
    })

    it("Build controller Path from open api - /<section1>/<section2>", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const ctrl = sut.buildcontrollers({}, "/test/cntrl")
        expect(ctrl).to.equal("testCntrl")
    })

    it("Build controller Path from open api - /<section1>/{name}/<section2>", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const ctrl = sut.buildcontrollers({}, "/test/{name}/cntrl")
        expect(ctrl).to.equal("testNameCntrl")
    })

    it("Build controller Path from open api - /<section1>/{name}/<section2>/{role}", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const ctrl = sut.buildcontrollers({}, "/test/{name}/cntrl/{role}")
        expect(ctrl).to.equal("testNameCntrlRole")
    })

    it("loadRoutesConfig", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const oper = sut.loadRoutesConfig()
        expect(oper).to.be.an("Object")
        expect(oper).to.deep.equal({
            "/app/custom": [],
            "/app/{config}/sam/{doc}": [],
            "/ui/config": [],
            "/ui/redirect": [],
        })
        expect(oper["/app/custom"].post).to.deep.equal({ controller: "appConfigSamDoc",
            method: "post",
            operationId: "setAppConfig",
            parameters: [],
            path: "/app/custom",
            })

        expect(oper["/app/{config}/sam/{doc}"].post).to.deep.equal({ controller: "appConfigSamDoc",
            method: "post",
            operationId: "setAppConfig",
            parameters: [],
            path: "/app/:config/sam/:doc" })

        expect(oper["/ui/config"].get).to.deep.equal({ controller: "uiConfig",
            method: "get",
            operationId: "getUIConfig",
            parameters: [],
            path: "/ui/config"})

        expect(oper["/ui/redirect"].get).to.deep.equal({ controller: "uiRedirect",
            method: "get",
            operationId: "getUIRedirect",
            parameters: [],
            path: "/ui/redirect",
          })
    })

    it("getMiddlewares", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3Spec.json")
        const oper = sut.getMiddlewares()
        expect(oper).to.be.an("Array")
        expect(oper.length).to.equal(1)
        expect(typeof oper[0].module === "function").to.be.true // tslint:disable-line
    })

    it("getMiddlewares: no middlewares", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3SpecNoMiddlewares.json")
        const oper = sut.getMiddlewares()
        expect(oper).to.be.an("Array")
        expect(oper.length).to.equal(0)
    })

    it("getMiddlewares: Operation based middlewares", async () => {
        const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3SpecMultiOperMiddlewares.json")
        const oper = sut.getMiddlewares()
        expect(oper).to.be.an("Array")
        expect(oper.length).to.equal(1)
        expect(typeof oper[0].module === "function").to.be.true // tslint:disable-line
        // expect(typeof oper[1].module === "function").to.be.true // tslint:disable-line
    })

    it("getMiddlewares: error middlewares", async () => {
        const errMethod = () => {
            const sut = new OpenApi2SpecUtil("./test/unit/utils/openapi3SpecErrMiddlewares.json")
            sut.getMiddlewares()
        }
        expect(errMethod).to.throw(/OpenAPISpec-Router: Error loading/)
    })

})
