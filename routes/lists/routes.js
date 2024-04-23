const fp = require('fastify-plugin')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.route({
      method: 'GET',
      url: '/',
      handler: async function lists (request, reply) {
        const { skip, take } = request.query

        return request.listsDataSource.listLists(skip, take)
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
  },
  {
    name: 'lists-routes',
    encapsulate: true
  }
)
