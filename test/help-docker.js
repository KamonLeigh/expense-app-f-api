'use strict'

const Containers = {
  postgres: {
    name: 'postgres-test',
    Image: 'postgres:latest',
    Host: '127.0.0.1',
    Env: [
      'POSTGRES_PASSWORD=mysecretpassword',
      'POSTGRES_DB=mydatabase',
      'POSTGRES_USER=postgres'
    ],
    ExposedPorts: {
      '5432/tcp': {}
    },
    HostConfig: {
      PortBindings: {
        '5432/tcp': [{ HostPort: '5432' }]
      }
    }
  }
}

const Docker = require('dockerode')
const { PrismaClient } = require('@prisma/client')
const { exec } = require('node:child_process')
const util = require('node:util')
const execPromise = util.promisify(exec)

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})
function dockerConsole () {
  const docker = new Docker()

  return {
    async getRunningContainers (container) {
      const containers = await docker.listContainers()

      return containers.find((running) => {
        return running.Names.some(name => name.includes(container.name))
      })
    },
    async startContainer (container) {
      const run = await this.getRunningContainers(container)

      if (!run) {
        await pullImage(container)
        const containerObj = await docker.createContainer(container)

        console.log('Starting container')
        await containerObj.start()
        await new Promise(resolve => setTimeout(resolve, 10000))
        console.log('running prisma')
        // await execPromise('dotenv -e  .env.test -- npx prisma migrate reset --force')
        await execPromise('npx prisma migrate dev --name init')
      }
    },
    async stopContainer (container) {
      const run = await this.getRunningContainers(container)

      if (run) {
        const containerObj = await docker.getContainer(run.Id)
        await containerObj.stop()
        execPromise(`docker rm ${run.Id}`)
      }
    }
  }

  async function pullImage (container) {
    const pullStream = await docker.pull(container.Image)
    return new Promise((resolve, reject) => {
      docker.modem.followProgress(pullStream, onFinish)

      function onFinish (err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    })
  }
}

module.exports = dockerConsole
module.exports.Containers = Containers
module.exports.prisma = prisma
