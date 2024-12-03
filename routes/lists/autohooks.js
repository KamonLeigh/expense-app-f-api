'use strict'
const fp = require('fastify-plugin')
const { Prisma } = require('@prisma/client')
const schemas = require('./schemas/loader')

module.exports = fp(
  async function listAutoHooks (fastify, _opts) {
    fastify.register(schemas)
    const lists = fastify.prisma.list

    const select = {
      listId: true,
      name: true,
      createdAt: true,
      updatedAt: true
    }

    // fastify.decorate("lists", lists);
    fastify.decorateRequest('listsDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.listsDataSource = {
        async listLists (skip = 0, take = 50) {
          const authorId = request.user.id
          const results = await lists.findMany({
            skip,
            take,
            where: {
              authorId,
              deletedAt: null
            },
            select
          })
          return results
        },
        async expenseTotal (id) {
          const expenseTotal = await fastify.prisma.expense.aggregate({
            _sum: {
              amount: true
            },
            where: {
              parentId: id
            }
          })
          return expenseTotal
        },
        async expenseCountList (parentId) {
          const expenseCount = await fastify.prisma.expense.count({
            where: {
              deletedAt: null,
              parentId
            }
          })

          return expenseCount
        },
        async createList () {
          const authorId = request.user.id
          try {
            const result = await lists.create({
              data: {
                ...request.body,
                authorId
              },
              select
            })

            return result.listId
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              e.statusCode = 400
              delete e.code
              e.message = 'List not created'
              throw e
            }
            throw e
          }
        },
        async updateList (listId) {
          try {
            const result = await lists.update({
              where: {
                authorId: request.user.id,
                deletedAt: null,
                listId
              },
              data: {
                name: request.body.name
              },
              select
            })
            return result
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              e.statusCode = 404
              delete e.code
              e.message = 'List not found'
              throw e
            }
            throw e
          }
        },
        async deleteList (listId) {
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
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              e.statusCode = 400
              delete e.code
              e.message = 'List not deleted'
              throw e
            }
            throw e
          }
        },
        async getList (id, skip = 0, take = 15) {
          try {
            const data = await lists.findFirst({
              where: {
                deletedAt: null,
                listId: id,
                authorId: request.user.id
              },
              select: {
                listId: true,
                authorId: true,
                updatedAt: true,
                name: true,
                expenses: {
                  select: {
                    expense: true,
                    note: true,
                    description: true,
                    amount: true,
                    authorId: true,
                    completed: true,
                    createdAt: true,
                    updatedAt: true,
                    parentId: true
                  },
                  skip,
                  take,
                  where: {
                    deletedAt: null
                  }
                }
              }
            })

            return data
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
              e.statusCode = 400
              delete e.code
              e.message = 'List data not found'
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
