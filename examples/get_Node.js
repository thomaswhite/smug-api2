const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.node('Node', {NodeID: 'SgX7vW'}, {_filter: null, _filteruri: null}) // BgFJb9 , 'ChildNodes'
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
