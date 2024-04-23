'use strict'

const fp = require('fastify-plugin')
const schemas = require('./schemas/loader')

module.exports = fp(
  async function userAutoHooks (fastify, _opts) {
    fastify.register(schemas)
    const users = fastify.prisma.user
    fastify.decorateRequest('usersDataSource')

    fastify.addHook('onRequest', async (request, reply) => {
      request.usersDataSource = {
        async readUser (email) {
          const user = await users.findFirst({
            where: {
              email
            }
          })

          return user
        },
        async createUser (user) {
          const newUser = await users.create({
            data: {
              ...user
            }
          })

          return newUser.userId
        }
      }
    })
  },
  {
    encapsulate: true,
    dependencies: ['@joggr/fastify-prisma'],
    name: 'user-store'
  }
)
