'use strict'

// This file contains code that we reuse
// between our tests.

const { build: buildApplication } = require('fastify-cli/helper')
const path = require('path')
const crypto = require('node:crypto')
const AppPath = path.join(__dirname, '..', 'app.js')
const flci = require('fastify-cli/helper')

const startArgs = '-l info --options app.js'

// Fill in this config with all the configurations
// needed for testing the application
function config (env) {
  return {
    configData: env
  }
}

// automatically build and tear down our instance
async function build (t) {
  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const app = await buildApplication(argv, config())

  // tear down our app after we are done
  t.teardown(app.close.bind(app))

  return app
}

const defaultEnv = {
  DATABASE_URL: 'postgresql://postgres:mysecretpassword@localhost:5432/mydatabase?schema:public',
  PASSWORD_SALT: 'TYEUHDHDBHDDBDBJKL',
  JWT_EXPIRE_IN: 604800000,
  JWT_SECRET: 'GDYGDJPOOPEFUHFHUHFYDSG',
  NODE_ENV: 'test',
  LOG_LEVEL: 'debug'

}

async function buildApp (t, env, serverOptions) {
  const app = await flci.build(startArgs, config({ ...defaultEnv, ...env }, serverOptions))
  t.teardown(() => { app.close() })

  // t.teardown(app.close.bind(app))
  return app
}

async function buildUser (app) {
  const randomUser = crypto.randomBytes(16).toString('hex')
  const randomEmail = `${crypto.randomBytes(8).toString('hex')}` + '@example.co.uk'

  const password = 'icanpass'

  await app.inject({
    method: 'POST',
    url: 'auth/register',
    payload: {
      name: randomUser,
      email: randomEmail,
      password
    }
  })

  const login = await app.inject({
    method: 'POST',
    url: 'auth/authenticate',
    payload: {
      email: randomEmail,
      password
    }
  })

  return {
    name: randomUser,
    email: randomEmail,
    token: login.json().token
  }
}

module.exports = {
  config,
  build,
  buildUser,
  buildApp
}
