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
      handler: async function createList (request, reply) {
        const insertId = await request.listsDataSource.createList(request.body)
        reply.status(201)
        return { id: insertId }
      }
    })

    fastify.route({
      method: 'POST',
      url: '/:id',
      handler: async function updateListName (request, reply) {
        // const title = request.body.name
        // const id = request.params.id
      }
    })
  },
  {
    name: 'lists-routes',
    encapsulate: true
  }
)
