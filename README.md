# express-api
A custom http router based on openapi3 specification to generate routes for rest API calls.

This library promotes the idea of generating or mapping code from [Open API 3.0.1](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md) specification. The developers are intended to write api contracts first manually and then generate or write controllers and middlewares of it.

API first strategy is advocated by the utility.

The following features are supported by this library:

-  Maps OpenAPI3 paths to custom js Controllers: This library reads open api 3 specification for a project and maps the paths to respective controllers.
-  Maps middleware using OpenAPI3 extensions
-  Validates incoming Request based on OpenAPI3 schema using ajv
-  In-build Support for CORS as a middleware (refer to router API)
-  Validates incoming Request based on OAuth2 token as per OpenAPI3  (In Progress) based on oauth2


## Install

```js
npm i -S express-api

```

## Usage

You create an object of router. This object maps Open API 3 paths to the custom controllers and also provides ability to validate incoming requests.

The following constructor options exists:

 `controllers:` **(Default is set to './src/controllers')**

 This specifies the path where controllers are located. Controllers handle all incoming traffic mapped to Open API 3 spec.

 `openApi3Spec:` **(Default is set to './openAPI3Spec.json')**

 This specifies the path where open api spec3 files is located.

 `validation:` **(Default is set to false )**
 This accepts a boolean value. This if enabled will use ajv to validate in coming request based on json schema defined in the open api 3 spec file.

***Router with default options:***

```js
import {router as ExpressRouter} from 'express-api'
let router = new ExpressRouter() // Parameters are optional
app.use(router.getBasePath(), router.getRouter())

```

***Router with custom options :***
```js
//You can provide one of all options as mentioned below:
const options = {
    validation: true,
    openApi3Spec: "./app/openAPI3_spec.json",
    controllers: './dist/controllers'}

import {router as ExpressRouter} from 'express-api'
let router = new ExpressRouter(options) // Parameters are optional
app.use(router.getBasePath(), router.getRouter())

```


### Example: How to use in my express application
Please setup the following:
 - Create openapi3Spec.json for your project as per open api 3.0.1 spec.
 - Setup a src/controller folder and put  (In future, we plan to provide yomean based generator for controller)

```js

// index.js

import express from 'express'
import {router as ExpressRouter} from 'express-api'
const app = new express()

class Application {

    static async run(app) {
        try {
            let router = new ExpressRouter()
            app.use(router.getBasePath(), router.getRouter())
            router.on('error', ({err, req}) => {console.log({err,  url: req.url,
                method: req.method,
                body: req.body,
                query: req.query
            })})
            return app.listen(process.env.PORT || 3000)
        } catch (err) {
             // eslint-disable-line
            console.log(err)
        }
    }
}
module.exports = Application.run(app);
```

## Global Error Handling

The library provides a global error handler to all incoming req as a middleware catches any err if not handled by the controller automatically. All such error the send back to the client with the following format in the response:


`HTTP Response Code: 503`

`Standard Json Response: {msg: 'Service side Error Occured. Please check Error Logs.'}`

In order to intercept the actual error the library provides a error event listener with the following attributes:
- err: Actual error object
- req: Express http request object
This is to allow application to customize logging of any error as their own requirements and tooling.

**Note:** The library does not log error. It expects the application to use this error event emitter and customize the logging.
```js
import express from 'express'
import {router as expressRouter} from 'express-api'

class Application {
 static async run(app) {

     let router = new expressRouter()

     router.on('error', ({err, req}) => {console.log({err,  url: req.url,
         method: req.method,
         body: req.body,
         query: req.query
     })})
   }
}
```

## How Controller work

The controller class contains the logic to be executed when a path is invoked for an incoming http request call by express. The open api 3 specification under paths provides support for `operationId`. The current framework using this property to call a static async function and passes the custom ctx = `{req, res}` object containing both req and res objects of express to the **static function** as a parameter.


### Open API 3 to Controller Class mapping:
- controller class: The name of the controller class name is derived from the name of the Path defined in the open spec api 3 document Or by reading from custom `x-express-controller` extension. (See example for more details below)
- operation Name: Name of the static function to be called by the framework which is mapped to the path in open spec api 3 as specified `operationId` attribute.

Note: The path of controller classes is specified in the constructor of the router as mentioned above.

If the operation called by the controller return a json object then framework will automatically to the following:
- Return the json as response body
- Set response Content-Type header as application/json
- Set response code as 200


``` js
//Sample Controller class
export default class TestController {
    static async setUser(ctx) {
        //ctx.req - HTTP Request Object
        //ctx.res - HTTP Response Object
        return {region: "NCAL"};
    }
}

```

### Example: Default Controller with no extension

|  Path                    | Controller Name |
| ------------------------ | --------------- |
| /app/{config}/sam/{doc}  | appConfigSamDoc |
| /app/custom              | appCustom       |

Note: The file name should exists in the controllers folder in order to map the route to the controller with matching operationId as a static function.

**Open API 3 spec with no extensions:**

```js
// Sample Open Spec 3 API
"paths": {
  "/app/{config}/sam/{doc}": { // Default Controller Name
    "post": {
      "description": "Returns all configurations to be consumer by our UI client",
      "summary": "get ui configurations",
      "operationId": "setAppConfig", // Controller static Operation
      "responses": {
        "200": {
          "description": "Invitee Registered"
        }
      }
    }
  }
}
```

**Controller Class**

```js
// File should be saved as `appConfigSamDoc.js` in the controllers folder as specified in the constructor when initializing router
export default class AppConfigSamDoc {
    static async setAppConfig(ctx) {
        //ctx.req - HTTP Request Object
        //ctx.res - HTTP Response Object      
        return {region: "NCAL"};
    }
    static async setCustomConfig(ctx) {
        //ctx.req - HTTP Request Object
        //ctx.res - HTTP Response Object
        return {region: "NCAL"};
    }
}
```
### Example: Custom Controller using `x-express-controller` extension
To override the default controller the following custom attribute can be to open api 3 spec.

**Open API 3 spec with custom x-express-controller extension:**

```js
// Sample Open Spec 3 API
"paths": {
  "/app/custom": {
    "post": {
      "x-express-controller": "appConfig", // Custom Controller Name
      "description": "Returns all configurations to be consumer by our UI client",
      "summary": "get ui configurations",
      "operationId": "setCustomConfig", // Controller static Operation
      "responses": {
        "200": {
          "description": "Invitee Registered"
        }
      }
    }
  }
}
```

**Controller Class:**

``` js
// File should be saved as `appConfig.js` in the controllers folder as specified in the constructor when initializing router

export default class AppConfig {
    static async setCustomConfig(ctx) {
      //ctx.req - HTTP Request Object
      //ctx.res - HTTP Response Object
      return {region: "NCAL"};
    }
}
```

## How to setup basePath as per open API 3 specification

If base path is set as per Open API 3 spec then all the paths should be prefixed with base path as per specification by the clients .
**Note: Please refer to the  for more information**

```js
// base path is set to "/v1/api"
"servers": [{
  "url": "https://{env}-myappname-1.{domain}/{basePath}",
  "description": "API server",
  "variables": {
    "env": {
      "enum": [
        "dev",
        "qa",
        "perf",
        "prod"
      ],
      "default": "dev",
      "description": "this value is assigned by the service provider"
    },
    "domain": {
      "enum": [
        "test1.org",
        "test2.org"
      ],
      "default": "test1.org"
    },
    "basePath": {
      "default": "/v1/api"
    }
  }
}]
```


## How to map middleware (Both custom & 3rd party)
The two ways you cam map your middle wares with express using this library
- Using express
- Custom "x-express-middlewares" extn added by current library in open api 3 spec

### Standard out of the box Using express

Please refer to online documentation of expressjs to read on more on this.
```js

import express from 'express'
import helmet from 'helmet'
class Application {

    static async run(app) {
      app.use(express.json())
      app.use(helmet({}))
      app.use(compress())
    }
}
```

### How to Request Validator to incoming calls
If you want to execute a validation function before controller is invokes then to the folowinf:

- Create a file in the controllers folder as <controllerFileName>.validator.js
- Implement static function with the same operationId for earch of the Paths
- The framework will pass the req object as param to this function
- If the function return an object then the framework if treat this as a validation error and will that as a response with 422 HTTP response code.

```js

// Controller File name: appConfigSamDoc.js
export default class AppConfigSamDoc {
    static async setAppConfig(ctx) {
        //ctx.req - HTTP Request Object
        //ctx.res - HTTP Response Object      
        return {location: "CA"};
    }
    static async setCustomConfig(ctx) {
        //ctx.req - HTTP Request Object
        //ctx.res - HTTP Response Object
        return {location: "CA"};
    }
}

// Validator File name: appConfigSamDoc.validator.js
export default class AppConfigSamDoc {
    static async setAppConfig(req) {
        // Return Validation errors
        return {errors: "Validation errors"};
    }
    static async setCustomConfig(req) {
      // Return No errors
      return undefined
    }
}
```

### Using "x-express-middlewares" custom extension in Open API 3 spec

The middleware to express can be added in two ways:
- Directly on the express object in start up file as per express-router documentation
- By adding a custom extension in Open spec API 3 file called **x-express-middlewares**  at the root level

```js
// The middlewares are added in the order specified here in your open  API 3 spec json file
"x-express-middlewares": {
  "compress": {},
  "helmet": {}
}
```

## Local project Setup for development

   Clone the project locally from git and execute the below mentioned steps:

   - `npm run local-start`

   The following rest API are made available in the example application (./examples/app/\*\*).
      - GET: Application information:

        curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://localhost:3008/v1/api/app/info
