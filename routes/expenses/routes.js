'use strict'

const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.route({
      method: 'GET',
      url: '/:id',
      handler: async function listExpense (request, reply) {
        const listId = request.params.id
        return request.expensesDataSource.listExpense(listId)
      }
    })
  },
  {
    name: 'expense-routes',
    encapsulate: true
  }
)
