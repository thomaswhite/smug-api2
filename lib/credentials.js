module.exports = function (extra) {
  'use strict'
  // https://stackoverflow.com/questions/4870328/read-environment-variables-in-node-js

  const path = require('path')
  const dotenv = require('dotenv')
  const dotenvExpand = require('dotenv-expand')

  const myEnv = dotenv.config({path: path.join(__dirname, '../.env')})
  dotenvExpand(myEnv)

  let credentials = {
    username: process.env.smugmug_username,
    app_key: process.env.smugmug_app_key,
    app_secret: process.env.smugmug_app_secret
  }

  credentials = Object.assign({}, credentials, extra)

  if (!credentials.username) {
    throw new Error('Missing smugmug username')
  }
  return credentials
}
