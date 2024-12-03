'use strict'

const fp = require('fastify-plugin')
module.exports = fp(async function schemaLoaderPlugin (fastify, opts) {
  fastify.addSchema(require('./create-response.json'))
  fastify.addSchema(require('./list-query.json'))
  fastify.addSchema(require('./list.json'))
  fastify.addSchema(require('./create-body.json'))
  fastify.addSchema(require('./read-params.json'))
  fastify.addSchema(require('./list-expenses.json'))
  fastify.addSchema(require('./list-query-params.json'))
})
