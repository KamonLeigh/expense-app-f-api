'use strict'
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
})

const path = require('path')
const AutoLoad = require('@fastify/autoload')

// Pass --options via CLI arguments in command to enable these options.
// module.exports.options = {}

module.exports = async function (fastify, opts) {
  fastify.log.info('The .env file has been read', process.env.DATABASE_URL)
}

module.exports = async function (fastify, opts) {
  // Place here your custom code!

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'schemas'),
    indexPattern: /^loader.js$/i
  })

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    dirNameRoutePrefix: false,
    ignorePattern: /.*.no-load\.js/,
    indexPattern: /^no$/i,
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    indexPattern: /.*routes(\.js|\.cjs)$/i,
    ignorePattern: /.*\.js/,
    autoHooksPattern: /.*hooks(\.js|\.cjs)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: Object.assign({}, opts)
  })
}

module.exports.options = require('./configs/server-options')
