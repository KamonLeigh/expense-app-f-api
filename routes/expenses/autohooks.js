'use strict'
const fp = require('fastify-plugin')
const { Prisma } = require('@prisma/client')

module.exports = fp(
  async function expenseAutoHooks (fastify, _opts) {
    const expenses = fastify.prisma.expense

    // fastify.decorate("expenses", expenses);
    fastify.decorateRequest('expensesDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.expensesDataSource = {
        async listExpense (id) {
          const listExpense = await expenses.findMany({
            where: {
              expense: id,
              deletedAt: null,
              authorId: request.user.id
            }
          })
          return listExpense
        },
        async foo () {
          return 'this is an example also'
        },
        async updateExpense (id, expense) {
          const result = await expenses.update({
            where: {
              expense: id,
              authorId: request.user.id
            },
            data: {
              ...expense.body
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
