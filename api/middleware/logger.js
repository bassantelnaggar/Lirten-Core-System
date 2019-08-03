/**
 * This is a middleware file. Middlewares run before all/specific routes and subsequent controllers
 * get run.
 */

const moment = require('moment')
const logger = (req,res,next) =>  {
    console.log(`${req.protocol} to the route ${req.originalUrl} at ${moment().format()}`)
    next()
}

module.exports = logger