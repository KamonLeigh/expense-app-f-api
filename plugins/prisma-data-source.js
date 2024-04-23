const fp = require('fastify-plugin')
const { PrismaClient } = require('@prisma/client')
const fastifyPrisma = require('@joggr/fastify-prisma')

module.exports = fp(
  async function (fastify, opts) {
    fastify.register(fastifyPrisma, {
      client: new PrismaClient(),
      clientConfig: {
        log: [{ emit: 'event', level: 'query' }]
      }
    })
  },
  {
    dependencies: ['application-config']
  }
)
