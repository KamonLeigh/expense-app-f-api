'use strict'

const t = require('tap')
const { buildApp, buildUser } = require('../helper')
const { headers } = require('../util')

t.beforeEach(async (t) => {
  const app = await buildApp(t)
  const user = await buildUser(app)

  t.context = { user, app }
})

t.test('access denied: lists', async (t) => {
  const result = await t.context.app.inject({
    url: '/lists'
  })
  t.equal(result.statusCode, 401)
})

t.test('allowed access: lists', async (t) => {
  const { token } = t.context.user
  const result = await t.context.app.inject({
    url: '/lists',
    ...headers(token)
  })
  t.equal(result.statusCode, 200)
  t.same(result.json(), { data: [] })
})

t.test('user isolation', async (t) => {
  const { app } = t.context
  const userOne = await t.context.user
  const userTwo = await buildUser(app)

  await app.inject({
    method: 'POST',
    url: '/lists',
    payload: { name: 'list user 1' },
    ...headers(userOne.token)
  })

  await app.inject({
    method: 'POST',
    url: '/lists',
    payload: { name: 'list user 2' },
    ...headers(userTwo.token)
  })

  {
    const list = await app.inject({
      url: '/lists',
      ...headers(userOne.token)
    })

    t.equal(list.statusCode, 200)
    t.match(list.json(), { data: [{ name: 'list user 1' }] })
  }

  {
    const list = await app.inject({
      url: 'lists',
      ...headers(userTwo.token)
    })

    t.equal(list.statusCode, 200)
    t.match(list.json(), { data: [{ name: 'list user 2' }] })
  }
})

t.test('insert list', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const create = await app.inject({
    method: 'POST',
    url: '/lists',
    payload: {
      name: 'list 1'
    },
    ...headers(token)
  })
  t.equal(create.statusCode, 201)
  // t.match(create.json(), {
  //   id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  // })

  const lists = await app.inject({
    url: '/lists',
    ...headers(token)
  })
  t.equal(lists.statusCode, 200)
  t.match(lists.json(), {
    data: [{
      // id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      name: 'list 1'
    }]
  })
})

t.test('insert list with no name', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const list = await app.inject({
    method: 'POST',
    url: '/lists',
    ...headers(token),
    payload: {
      name: ''
    }
  })

  t.equal(list.statusCode, 400, 'Wrong credentials provider')
})

t.test('get list item', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const noList = await app.inject({
    url: `/lists/${'a'.repeat(36)}`,
    ...headers(token)
  })
  t.equal(noList.statusCode, 404, 'No list found')
})

t.test('test pagination', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const lists = ['list 1', 'list 2', 'list 3', 'list 4']

  for (const name of lists) {
    const create = await app.inject({
      method: 'POST',
      url: '/lists',
      payload: {
        name
      },
      ...headers(token)
    })
    t.equal(create.statusCode, 201)
  }

  const pagination = await app.inject({
    method: 'GET',
    path: '/lists',
    query: { skip: 1, take: 1 },
    ...headers(token)
  })

  t.equal(pagination.statusCode, 200)
  t.match(pagination.json(), { data: [{ name: 'list 2' }] })

  const wrongPagination = await app.inject({
    url: '/lists',
    query: { skip: 100, limit: 100 },
    ...headers(token)
  })
  t.equal(wrongPagination.statusCode, 200)
  t.equal(wrongPagination.json().data.length, 0)

  const paginationTwo = await app.inject({
    url: '/lists',
    query: { skip: 1.5, take: 1 },
    ...headers(token)
  })

  t.equal(paginationTwo.statusCode, 400)

  const search = await app.inject({
    url: '/lists',
    query: { search: 'list 4' },
    ...headers(token)
  })

  t.equal(search.statusCode, 200)
  t.match(search.json(), { data: [{ name: 'list 4' }] })
})

t.test('update list', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const noList = await app.inject({
    method: 'PUT',
    url: `/lists/${'a'.repeat(36)}`,
    payload: {
      name: 'foo bar'
    },
    ...headers(token)

  })

  t.equal(noList.statusCode, 404, 'List not found')

  const create = await app.inject({
    method: 'POST',
    url: '/lists',
    payload: {
      name: 'Hello World'
    },
    ...headers(token)
  })

  t.equal(create.statusCode, 201)

  const edit = await app.inject({
    method: 'PUT',
    url: `/lists/${create.json().id}`,
    payload: {
      name: 'Hello World 2'
    },
    ...headers(token)
  })

  t.equal(edit.statusCode, 204)

  const updateList = await app.inject({
    url: `/lists/${create.json().id}`,
    ...headers(token)
  })

  t.equal(updateList.statusCode, 200)
  t.match(updateList.json(), {
    data: {
      listId: create.json().id,
      name: 'Hello World 2',
      expenses: []
    },
    count: 0
  })
})

t.test('delete list', async (t) => {
  const { app } = t.context
  const { token } = t.context.user

  const noList = await app.inject({
    method: 'DELETE',
    url: `/lists/${'a'.repeat(36)}`,
    ...headers(token)
  })

  t.equal(noList.statusCode, 400, 'List not found')

  const create = await app.inject({
    method: 'POST',
    url: '/lists',
    payload: {
      name: 'foo bar'
    },
    ...headers(token)
  })

  t.equal(create.statusCode, 201)
  const delteItemNoId = await app.inject({
    method: 'DELETE',
    url: '/lists',
    ...headers(token)
  })

  t.equal(delteItemNoId.statusCode, 404, 'Wrong credentials provider')

  const deleteItem = await app.inject({
    method: 'DELETE',
    url: `/lists/${create.json().id}`,
    ...headers(token)
  })

  // console.log(deleteItem.json(), 'ookiokovk l l')
  t.equal(deleteItem.statusCode, 204)
  // t.match(deleteItem.json(), { done: true })
})
