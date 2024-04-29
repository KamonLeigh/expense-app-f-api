'use strict'
const fp = require('fastify-plugin')
const { Prisma } = require('@prisma/client')

module.exports = fp(
  async function listAutoHooks (fastify, _opts) {
    const lists = fastify.prisma.list

    // fastify.decorate("lists", lists);
    fastify.decorateRequest('listsDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.listsDataSource = {

        async listLists (skip = 0, take = 50) {
          const authorId = request.user.userId
          const results = await lists.findMany({
            skip,
            take,
            where: {
              authorId,
              deletedAt: null
            }
          })
          return results
        },
        async createList () {
          const authorId = request.user.id
          try {
          const result = await lists.create({
            data: {
              ...request.body,
              authorId
            }
          })

          return result
          } catch(e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError){
              e.statusCode = 400
              delete e.code
              e.message = 'List not created'
              throw e
            }
            throw e
          }
        },
        async updateList(listId){

          try {
          const result = await lists.update({
            where: {
              authorId: request.user.id,
              deletedAt: null,
              listId
            },
            data: {
              name: request.body.name
            }
          })
          return result
          } catch(e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError){
              e.statusCode = 400
              delete e.code
              e.message = 'List not found'
              throw e
            }
            throw e
          }
        },
        async deleteList(listId){

          try {
          await lists.update({
            where: {
              authorId: request.user.id,
              listId
            },
            data: {
              deletedAt: new Date().toISOString()
            }
          })
          } catch(e){
            if (e instanceof Prisma.PrismaClientKnownRequestError){
              e.statusCode = 400
              delete e.code
              e.message = 'List not deleted'
              throw e
            }
            throw e
          }
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
