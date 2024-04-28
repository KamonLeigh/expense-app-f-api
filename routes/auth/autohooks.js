'use strict'

const fp = require('fastify-plugin')
const schemas = require('./schemas/loader')
const generateToken = require('./generate-token')

module.exports = fp(
  async function userAutoHooks (fastify, _opts) {
    fastify.register(schemas)
    const users = fastify.prisma.user
    const tokens = fastify.prisma.token
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
        },
        async updatePassword (email) {
          const user = await users.findFirst({
            where: {
              email
            }
          })

          if (!user) {
            return false
          }

          const token = generateToken()

          const result = await tokens.create({
            data: {
              value: token,
              authorId: user.userId,
              access: Date.now() + 3600000
            }
          })

          if (!result) {
            return false
          }
          // send email to user with created token in URL
          return true
        },
        async changePassword (token, salt, hash) {
          const user = await tokens.findFirst({
            where: {
              access: token
            }
          })
          const userId = user.authorId
          const userUpdate = user.update({
            where: {
              userId
            },
            data: {
              salt,
              hash
            }
          })

          const tokenDelete = token.delete({
            where: {
              access: token
            }
          })

          const [userResult, tokenResult] = await fastify.prisma.$transaction([await userUpdate, tokenDelete])

          return { userResult, tokenResult }
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
