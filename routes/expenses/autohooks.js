'use strict'
const fp = require('fastify-plugin')
const { Prisma } = require('@prisma/client')
const schemas = require('./schemas/loader')

module.exports = fp(
  async function expenseAutoHooks (fastify, _opts) {
    fastify.register(schemas)
    const expenses = fastify.prisma.expense

    // fastify.decorate("expenses", expenses);
    fastify.decorateRequest('expensesDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.expensesDataSource = {
        async getExpense (id) {
          const expense = await expenses.findFirst({
            where: {
              expense: id,
              deletedAt: null,
              authorId: request.user.id
            }
          })
          return expense
        },
        async foo () {
          return 'this is an example also'
        },
        async updateExpense (id, userId, expense) {
          const result = await expenses.update({
            where: {
              expense: id,
              authorId: request.user.id
            },
            data: {
              ...expense
            }
          })
          return result
        },
        async completeExpense (id, completed) {
          const result = await expenses.update({
            where: {
              expense: id,
              authorId: request.user.id
            },
            data: {
              completed
            }
          })

          return result
        },
        async deleteExpense (id) {
          try {
            const result = await expenses.update({
              where: {
                expense: id,
                authorId: request.user.id
              },
              data: {
                deletedAt: new Date().toISOString()
              }
            })

            return result
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequest) {
              e.statusCode = 400
              delete e.code
              e.message = 'Expense not deleted'
              throw e
            }

            throw e
          }
        },
        async createExpense (parentId, body) {
          const expense = await expenses.create({
            data: {
              authorId: request.user.id,
              parentId,
              ...body
            }
          })

          return expense
        },
        async getAllExpense (id, skip = 0, take = 10) {
          const result = await expenses.findMany({
            skip,
            take,
            where: {
              parentId: id,
              authorId: request.user.id,
              deleteAt: null
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
    name: 'expense-store'
  }
)
