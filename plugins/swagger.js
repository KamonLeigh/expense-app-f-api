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
}, { dependencies: ['application-config'] })
