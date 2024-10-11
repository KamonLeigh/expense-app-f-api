const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/swagger'), {
    routePrefix: '/docs',
    exposeRoute: fastify.secrets.NODE_ENV !== 'production',
    swagger: {
      title: 'Fastify app',
      description: 'Fastify TODO Examples',
      version: require('../package.json').version
    }
  })

  fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/doc',
  })


}, { dependencies: ['application-config'] })
