const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.node('ChildNodes', {NodeID: 'SgX7vW'}, {})
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
