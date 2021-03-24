const express = require('express')
const Application = require('./app')
const app = express()
/**
 * Step 2: Start the application
 */
module.exports = Application.run(app)
