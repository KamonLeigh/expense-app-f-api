'use strict'

const fp = require('fastify-plugin')
const generateHash = require('./generate-hash')

module.exports = fp(
  async function (fastify, _opts) {
    fastify.route({
      method: 'POST',
      schema: {
        description: 'Register new user.',
        tags: ['user'],
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
        tags: ['user'],
        description: 'Authenticate user.',
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
      schema: {
        description: 'Logout current user.',
        tags: ['user']
      },
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
        tags: ['user'],
        description: 'Refresh token.',
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
        description: 'Get current logged in user.',
        tags: ['user'],
        headers: fastify.getSchema('schema:auth:token-header'),
        response: {
          200: fastify.getSchema('schema:auth:user')
        }
      },
      handler: async function meHandler (request, reply) {
        return request.user
      }
    })

    fastify.route({
      method: 'POST',
      url: '/reset',
      schema: {
        description: 'Request password reset',
        tags: ['user'],
        body: fastify.getSchema('schema:auth:reset')
      },
      handler: async function resetPassword (request, reply) {
        const result = await request.usersDataSource.updatePassword(request.body.email)

        if (!result) {
          const err = new Error('Wrong credentials provider')
          err.statusCode = 401
          throw err
        }

        reply.code(200)

        return { result: true }
      }
    })

    fastify.route({
      method: 'POST',
      url: '/password/:token',
      schema: {
        description: 'Reset password',
        tags: ['user'],
        params: fastify.getSchema('schema:auth:token'),
        body: fastify.getSchema('schema:auth:password')
      },
      handler: async function changePassword (request, reply) {
        // const { salt, hash } = await generateHash(request.body.password, user.salt)

        // const { user, token } = await request.usersDataSource(request.params.token, salt, hash)

        // if (!token || !user) {
        //   const err = new Error('Error processing')
        //   err.statusCode = 403
        //   throw err
        // }

        reply.code(200)
        // return { user: user.userId }
      }
    })
  },
  {
    name: 'users-routes',
    dependencies: ['authentication plugin'],
    encapsulate: true
  }
)

// module.exports.prefixOverride = ''
