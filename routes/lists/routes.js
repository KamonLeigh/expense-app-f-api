const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.addHook('onRequest', fastify.authenticate)
    fastify.route({
      method: 'GET',
      url: '/',
      handler: async function lists (request, reply) {
        const { skip, take } = request.query

        const data = await request.listsDataSource.listLists(skip, take)
        return { data }
      }
    })
    fastify.route({
      method: 'POST',
      url: '/',
      schema: {
        body: fastify.getSchema('schema:list:create:body'),
        response: {
          201: fastify.getSchema('schema:list:create:response')
        }
      },
      handler: async function createList (request, reply) {
        if (!request.body.name) {
          const err = new Error('Wrong credentials provider')
          err.statusCode = 400
          throw err
        }
        const insertId = await request.listsDataSource.createList(request.body)
        reply.status(201)
        return { id: insertId }
      }
    })

    fastify.route({
      method: 'PUT',
      url: '/:id',
      schema: {
        params: fastify.getSchema('schema:list:read:params'),
        body: fastify.getSchema('schema:list:create:body')
      },
      handler: async function updateListName (request, reply) {
        const id = request.params.id
        const name = request.body.name
        if (!id || !name) {
          const err = new Error('Wrong credentials provider')
          err.statusCode = 400
          throw err
        }
        await request.listsDataSource.updateList(id, request.body.name)

        reply.code(204)
      }
    })

    fastify.route({
      method: 'DELETE',
      url: '/:id',
      schema: {
        params: fastify.getSchema('schema:list:read:params')
      },
      handler: async function deleteList (request, reply) {
        const id = request.params.id

        if (!id) {
          const err = new Error('Wrong credentials provider')
          err.statusCode = 400
          throw err
        }

        await request.listsDataSource.deleteList(id)
        reply.code(200)
      }
    })

    fastify.route({
      method: 'GET',
      url: '/:id',
      schema: {
        params: fastify.getSchema('schema:list:read:params')
      },
      handler: async function getList (request, reply) {
        const id = request.params.id
        const { skip, take } = request.query
        const data = await request.listsDataSource.getList(id, skip, take) ?? []
        const count = await request.listsDataSource.expenseCountList(id) ?? 0
        const total = await request.listaDataSource.expenseTotal(id) ?? 0
        reply.code(200)
        return {
          data,
          count,
          total
        }
      }
    })

    fastify.route({
      method: 'GET',
      url: '/:id/total',
      schema: {
        params: fastify.getSchema('schema:list:read:params')
      },
      handler: async function expenseTotal(request, reply) {
        const total = await request.listaDataSource.expenseTotal(id) ?? 0
        reply.code(200)
        return {
          total
        }
      }
    })
  },
  {
    name: 'lists-routes',
    encapsulate: true
  }
)
