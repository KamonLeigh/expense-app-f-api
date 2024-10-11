'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/',  async function (request, reply) {
    return 'this is an example'
  })

  fastify.get('hello', async function (request, reply) {
    return 'this is an hello route'
  })
}
