'use strict'
const fp = require('fastify-plugin')

module.exports = fp(
  async function expenseAutoHooks (fastify, _opts) {
    const expenses = fastify.prisma.expense

    // fastify.decorate("expenses", expenses);
    fastify.decorateRequest('expensesDataSource', null)

    fastify.addHook('onRequest', async (request, reply) => {
      request.expensesDataSource = {
        async listExpense () {
          const listExpenses = await expenses.findMany()
          return listExpenses
        },
        async foo () {
          return 'this is an example also'
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
