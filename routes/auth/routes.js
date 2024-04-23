'use strict'

const fp = require('fastify-plugin')
const generateHash = require('./generate-hash')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.route({
      method: 'POST',
      schema: {
        body: fastify.getSchema('schema:auth:register')
      },
      url: '/register',
      handler: async function registerHandler (request, reply) {
        const existingUser = await request.usersDataSource.readUser(
          request.body.email
        )

        if (existingUser) {
          const error = new Error('User is already registered')
          reply.statusCode = 409
          throw error
        }

        const { salt, hash } = await generateHash(request.body.password)

        try {
          const userId = await request.usersDataSource.createUser({
            email: request.body.email,
            name: request.body.name,
            salt,
            hash
          })

          request.log.info({ userId })

          reply.code(201)
          return { registered: true }
        } catch (error) {
          reply.code(500)
          return { registered: false }
        }
      }

    })

    fastify.route({
      method: 'POST',
      url: '/authenticate',
      schema: {
        body: fastify.getSchema('schema:auth:authenticate'),
        response: {
          200: fastify.getSchema('schema:auth:token')
        }
      },
      handler: async function authenticateHandler (request, reply) {
        const user = await request.usersDataSource.readUser(request.body.email)

        if (!user) {
          const error = new Error('wrong credentials provided')
          error.statusCode = 401
          throw error
        }

        const { hash } = await generateHash(request.body.password, user.salt)

        if (hash !== user.hash) {
          const err = new Error('Wrong credentials provider')
          err.statusCode = 401
          throw err
        }

        request.user = user

        return refreshHandler(request, reply)
      }

    })

    async function refreshHandler (request, reply) {
      const token = await request.generateToken()
      return { token }
    }

    fastify.route({
      method: 'POST',
      url: '/logout',
      onRequest: fastify.authenticate,
      handler: async function logoutHandler (request, reply) {
        request.revokeToken()
        reply.code(204)
      }
    })

    fastify.route({
      method: 'POST',
      url: 'refresh',
      onRequest: fastify.authenticate,
      schema: {
        headers: fastify.getSchema('schema:auth:token-header'),
        response: {
          200: fastify.getSchema('schema:auth:token')
        }
      },
      handler: refreshHandler
    })

    fastify.route({
      method: 'GET',
      url: '/me',
      onRequest: fastify.authenticate,
      schema: {
        headers: fastify.getSchema('schema:auth:token-header'),
        response: {
          200: fastify.getSchema('schema:auth:user')
        }
      },
      handler: async function meHandler (request, reply) {
        return request.user
      }
    })
  },
  {
    name: 'users-routes',
    dependencies: ['authentication plugin'],
    encapsulate: true
  }
)

//module.exports.prefixOverride = ''
