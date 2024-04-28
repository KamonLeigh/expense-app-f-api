'use strict'
const fp = require('fastify-plugin')

module.exports = fp(
  async function listAutoHooks (fastify, _opts) {
    const lists = fastify.prisma.list

    // fastify.decorate("lists", lists);
    fastify.decorateRequest('listsDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.listsDataSource = {

        async listLists (skip = 0, take = 50) {
          console.log(request.user)
          const authorId = request.user.userId
          const results = await lists.findMany({
            skip,
            take,
            where: {
              authorId
            }
          })
          return results
        },
        async createList () {
          const authorId = request.user.id
          const result = await lists.create({
            data: {
              ...request.body,
              authorId
            }
          })

          return result
        }
      }
    })
  },
  {
    encapsulate: true,
    dependencies: ['@joggr/fastify-prisma'],
    name: 'list-store'
  }
)
