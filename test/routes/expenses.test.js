'use strict'

const t = require('tap')
const { buildApp, buildUser } = require('../helper')
const { headers } = require('../util')

t.beforeEach(async (t) => {
  const app = await buildApp(t)
  const user = await buildUser(app)

  t.context = { user, app }
})

t.test('get expense item', async (t) => {
  const { app } = t.context
  const { token } = t.context.user
  const noExpense = await app.inject({
    url: `/expenses/${'a'.repeat(36)}`,
    ...headers(token)
  })

  t.equal(noExpense.statusCode, 404, 'expense not found')
})

t.test('create expense', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const createList = await app.inject({
    method: 'POST',
    url: '/lists',
    payload: {
      name: 'list 1'
    },
    ...headers(token)
  })

  t.equal(createList.statusCode, 201)

  const createExpenseFailure = await app.inject({
    method: 'POST',
    url: `/expenses/${createList.json().id}`,
    payload: {
      note: 'expense 1',
      description: 'expense description'
    }
  })
  t.equal(createExpenseFailure.statusCode, 401)

  const createExpense = await app.inject({
    method: 'POST',
    url: `/expenses/${createList.json().id}`,
    payload: {
      note: 'expense 1',
      description: 'expense description'
    },
    ...headers(token)
  })

  t.equal(createExpense.statusCode, 201)

  const updateFailExpense = await app.inject({
    method: 'PUT',
    url: `/expenses/${createExpense.json().id}`,
    payload: {
      note: 'expense 1 update',
      description: 'expense update description'
    }
  })

  t.equal(updateFailExpense.statusCode, 401)

  const updateExpense = await app.inject({
    method: 'PUT',
    url: `/expenses/${createExpense.json().id}`,
    payload: {
      note: 'expense 1 update',
      description: 'expense update description'
    },
    ...headers(token)
  })

  t.equal(updateExpense.statusCode, 204)

  const expense = await app.inject({
    url: `/expenses/${createExpense.json().id}`,
    ...headers(token)
  })

  t.equal(expense.statusCode, 200)

  t.match(expense.json(), {
    note: 'expense 1 update',
    description: 'expense update description'
  })
})

t.test('delete expense', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const createList = await app.inject({
    method: 'POST',
    url: '/lists',
    payload: {
      name: 'list 1'
    },
    ...headers(token)
  })

  t.equal(createList.statusCode, 201)

  const createExpense = await app.inject({
    method: 'POST',
    url: `/expenses/${createList.json().id}`,
    payload: {
      note: 'expense 1',
      description: 'expense description'
    },
    ...headers(token)
  })

  t.equal(createExpense.statusCode, 201)

  const deleteExpenseFailure = await app.inject({
    method: 'DELETE',
    url: `/expenses/${createExpense.json().id}`
  })

  t.equal(deleteExpenseFailure.statusCode, 401)

  const deleteExpense = await app.inject({
    method: 'DELETE',
    url: `/expenses/${createExpense.json().id}`,
    ...headers(token)
  })

  t.equal(deleteExpense.statusCode, 204)
})
