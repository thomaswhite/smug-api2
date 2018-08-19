const creds = require('../../lib/credentials.js')()
const smug = require('../../index.js')(creds)

const util = require('util')

smug.connect() // getAPI
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
