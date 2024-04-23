'use strict'

const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.route({
      method: 'GET',
      url: '/',
      handler: async function listExpense (request, reply) {
        return request.expensesDataSource.listExpense()
      }
    })
  },
  {
    name: 'expense-routes',
    encapsulate: true
  }
)
