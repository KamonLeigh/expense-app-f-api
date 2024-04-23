const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const generateHash = require('../routes/auth/generate-hash')

async function main () {
  const { salt, hash } = await generateHash('password1234')
  const richard = await prisma.user.upsert({
    where: { email: 'richard@prisma.io' },
    update: {},
    create: {
      email: 'richard@prisma.io',
      name: 'richard',
      hash,
      salt
    }
  })

  const { salt: salt1, hash: hash1 } = await generateHash('1234password')
  await prisma.user.upsert({
    where: { email: 'charles@prisma.io' },
    update: {},
    create: {
      email: 'charles@prisma.io',
      name: 'charles',
      hash: hash1,
      salt: salt1
    }
  })

  const list = await prisma.list.create({
    data: {
      authorId: richard.userId,
      name: 'shopping list'
    }
  })

  const lists = [
    {
      authorId: richard.userId,
      name: "pete's birthday requests"
    },
    {
      authorId: richard.userId,
      name: 'work list'
    }
  ]

  await prisma.list.createMany({
    data: [
      ...lists
    ]
  })

  const expenseList = [
    {
      note: 'bread',
      description: 'Make sure sourdough bread is bought',
      authorId: richard.userId,
      amount: 0.99,
      type: 'FOOD',
      parentId: list.listId
    },
    {
      note: 'baked beans',
      authorId: richard.userId,
      description: 'Only buy Heinz!!',
      amount: 0.79,
      type: 'FOOD',
      parentId: list.listId
    },
    {
      note: 'Dog food',
      authorId: richard.userId,
      description: '',
      amount: 0.79,
      type: 'FOOD',
      parentId: list.listId
    }
  ]

  const createMany = await prisma.expense.createMany({
    data: [
      ...expenseList
    ],
    skipDuplicates: true
  })

  console.log({ richard, list, createMany })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
