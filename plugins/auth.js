'use strict'

const fp = require('fastify-plugin')
const fastifyJwt = require('@fastify/jwt')

module.exports = fp(async function authenticationPlugin (fastify, opts) {
  const revokedToken = new Map()

  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    trusted: function isTrusted (_request, decodedToken) {
      return !revokedToken.has(decodedToken.jti)
    }
  })

  fastify.decorate('authenticate', async function authenticate (request, reply) {
    try {
      await request.jwtVerify()
    } catch (error) {
      reply.send(error)
    }
  })

  fastify.decorateRequest('revokeToken', function () {
    revokedToken.set(this.user.jti, true)
  })

  fastify.decorateRequest('generateToken', function () {
    const token = fastify.jwt.sign({
      id: this.user.userId,
      name: this.user.name,
      email: this.user.email
    }, {
      jti: String(Date.now()),
      expiresIn: process.env.JWT_EXPIRE_IN
    })

    return token
  })
}, {
  name: 'authentication plugin',
  dependencies: ['application-config']
})
