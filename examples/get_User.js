const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.user('User', {}, {_filter: null, _expand: null}) // , _filteruri:null
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
