'use strict'

const fp = require('fastify-plugin')
module.exports = fp(
  async function (fastify, _opts) {
    fastify.addHook('onRequest', fastify.authenticate)
    fastify.route({
      method: 'GET',
      url: '/:id',
      schema: {
        params: fastify.getSchema('schema:expense:read:params'),
        body: {
          200: fastify.getSchema('schema:expense')
        }
      },
      handler: async function getExpense (request, reply) {
        const listId = request.params.id
        return request.expensesDataSource.getExpense(listId)
      }
    })

    fastify.route({
      method: 'POST',
      url: '/:parentId',
      schema: {
        body: fastify.getSchema('schema:expense:create:body'),
        response: {
          201: fastify.getSchema('schema:expense:create:response')
        }
      },
      handler: async function createExpense (request, reply) {
        const parentId = request.params.parentId
        const expense = await request.expenseDataSource(parentId, request.body)

        reply.status(201)

        return { id: expense }
      }
    })

    fastify.route({
      method: 'PUT',
      url: '/:id',
      schema: {
        body: fastify.getSchema('schema:expense:create:body')
      },
      handler: async function updateExpense (request, reply) {
        const id = request.params.id
        const userId = request.user.id

        await request.expenseDataSource.updateExpense(id, userId, request.body)

        reply.code(204)
      }
    })

    fastify.route({
      method: 'DELETE',
      url: '/:id',
      schema: {
        params: fastify.getSchema('schema:expense:read:params')
      },
      handler: async function deleteExpense (request, reply) {
        const id = request.params.id

        await request.expenseDataSource.deleteExpense(id)
        reply.code(204)
      }
    })

    fastify.route({
      method: 'PUT',
      url: ':id/complete',
      schema: {
        params: fastify.getSchema('schema:expense:read:params')
      },
      handler: async function completeExpense (request, reply) {
        const id = request.params.id
        const expense = await request.expensesDataSource.listExpense(id)

        if (!expense) {
          reply.code(404)
          return { error: 'Expense not found' }
        }

        await request.expensesDataSource.completeExpense(id, !expense.completed)
      }
    })

    fastify.route({
      method: 'GET',
      url: ':id/all',
      schema: {
        params: fastify.getSchema('schema:expense:create:body'),
      },
      handler: async function getAllExpense (request, reply) {
        const id = request.params.id
        const { skip, take } = request.query
        const data = await request.expenseDataSource.getAllExpense(id, skip, take)

        return data ?? []
      }
    })


  },
  {
    name: 'expense-routes',
    encapsulate: true
  }
)
