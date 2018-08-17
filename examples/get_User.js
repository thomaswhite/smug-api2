const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.user({}, {_filter: null, _expand: null}, 'User')
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
