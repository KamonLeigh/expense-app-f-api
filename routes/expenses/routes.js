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
        response: {
          200: fastify.getSchema('schema:expense')
        }
      },
      handler: async function getExpense (request, reply) {
        const expenseId = request.params.id
        const expense = await request.expensesDataSource.getExpense(expenseId)

        if (!expense) {
          reply.code(404)
          return { message : "expense not found"}
        }

        reply.code(200)
        return expense
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
        const expense = await request.expensesDataSource.createExpense(parentId, request.body)

        reply.status(201)

        return { id: expense.expense }
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

        await request.expensesDataSource.updateExpense(id, userId, request.body)

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


        await request.expensesDataSource.deleteExpense(id)
        reply.code(204)
        return { done: true }
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
        const expense = await request.expensesDataSource.getExpense(id)

        if (!expense) {
          reply.code(404)
          return { error: 'Expense not found' }
        }

        await request.expensesDataSource.completeExpense(id, !expense.completed)

        return { done: true }
      }
    })

    fastify.route({
      method: 'GET',
      url: ':id/all',
      schema: {
        params: fastify.getSchema('schema:expense:read:params'),
      },
      handler: async function getAllExpense (request, reply) {
        const id = request.params.id
        const { skip, take } = request.query
        const data = await request.expensesDataSource.getAllExpense(id, skip, take)

        return data ?? []
      }
    })


  },
  {
    name: 'expense-routes',
    encapsulate: true
  }
)
