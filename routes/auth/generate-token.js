'use strict'

const crypto = require('node:crypto')

module.exports = function generateToken () {
  return crypto.randomUUID()
}
