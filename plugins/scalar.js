'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@scalar/fastify-api-reference'), {
    routePrefix: '/references',
    configuration: {
      spec: {
        content: () => fastify.swagger()
      }
    }
  })
})
