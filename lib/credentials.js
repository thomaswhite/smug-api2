module.exports = function () {
  'use strict'
  // https://stackoverflow.com/questions/4870328/read-environment-variables-in-node-js

  const path = require('path')
  const dotenv = require('dotenv')
  const dotenvExpand = require('dotenv-expand')

  const myEnv = dotenv.config({path: path.join(__dirname, '../.env')})
  dotenvExpand(myEnv)

  const credentials = {
    username: process.env.smugmug_username,
    api_key: process.env.smugmug_api_key
  }

  if (!process.env.smugmug_username) {
    throw new Error('Missing "smugmug_username" variable from environment')
  }
  return credentials
}
