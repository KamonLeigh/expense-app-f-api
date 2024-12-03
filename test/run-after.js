const t = require('tap')
const dockerHelper = require('./help-docker')

const docker = dockerHelper()
const { Containers, prisma } = dockerHelper

t.teardown(async () => {
  await prisma.$disconnect()
  await docker.stopContainer(Containers.postgres)
})
