const t = require('tap')
const { buildApp } = require('../helper')

t.test('cannot access protected routes', async (t) => {
  const app = await buildApp(t)
  const privateRoutes = ['/auth/me']
  for (const url of privateRoutes) {
    const response = await app.inject({ method: 'GET', url })
    t.equal(response.statusCode, 401)
    t.same(response.json(), {
      statusCode: 401,
      code: 'FST_JWT_NO_AUTHORIZATION_IN_HEADER',
      error: 'Unauthorized',
      message: 'No Authorization was found in request.headers'
    })
  }
})

t.test('register user', async (t) => {
  const app = await buildApp(t)
  const response = await app.inject({
    method: 'POST',
    url: 'auth/register',
    payload: {
      name: 'test',
      email: 'foo@example.com',
      password: 'icanpass'
    }
  })
  t.equal(response.statusCode, 201)
  t.same(response.json(), { registered: true })
})

t.test('login successfully', async (t) => {
  const app = await buildApp(t)

  const login = await app.inject({
    method: 'POST',
    url: 'auth/authenticate',
    payload: {
      email: 'foo@example.com',
      password: 'icanpass'
    }
  })

  t.equal(login.statusCode, 200)
  // t.equal(login.json(), { token: /(w*\.){2}.*/ }, 'the token is valid JWT')

  t.test('access protected route', async (t) => {
    const response = await app.inject({
      method: 'GET',
      url: 'auth/me',
      headers: {
        authorization: `Bearer ${login.json().token}`
      }

    })
    t.equal(response.statusCode, 200)
    t.match(response.json(), { name: 'test' })
  })
})
