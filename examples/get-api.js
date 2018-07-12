const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)
const get_api_url = require('../lib/get-api.js')(creds)
const util = require('util')

const url = get_api_url.getUrl('User')
console.info(url)

/*
smug.connect() // getAPI
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
*/