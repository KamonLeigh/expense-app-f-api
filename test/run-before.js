const t = require('tap')
const dockerHelper = require('./help-docker')
const docker = dockerHelper()
const { Containers, prisma } = dockerHelper

t.before(async function before () {
  await docker.startContainer(Containers.postgres)
  await prisma.$connect()
})
