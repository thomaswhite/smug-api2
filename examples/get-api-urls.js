const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)
const util = require('util')

smug.getAPI({save: true}) //
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
