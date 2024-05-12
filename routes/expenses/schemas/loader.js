'use strict'

const fp = require('fastify-plugin')
module.exports = fp(async function schemaLoaderPlugin (fastify, _opts) {
  fastify.addSchema(require('./create-body.json '))
  fastify.addSchema(require('./create-response.json'))
  fastify.addSchema(require('./read-params.json'))
  fastify.addSchema(require('./expense.json'))
})
