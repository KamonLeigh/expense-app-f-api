'use strict'

const crypto = require('node:crypto')
const util = require('node:util')

const pbkdf2 = util.promisify(crypto.pbkdf2)

module.exports = async function generateHash (password, salt) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex')
  }

  console.log(salt)

  const newsalt = salt + process.env.PASSWORD_SALT

  const hash = (await pbkdf2(password, newsalt, 1000, 64, 'sha256')).toString(
    'hex'
  )

  return { hash, salt }
}
