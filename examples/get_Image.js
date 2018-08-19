const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.image('Image', {ImageKey: 'bbjfD8n'}, {}) // _filter:null,   _filteruri:'AlbumImages'   _filter: 'Name,NickName,WebUri',  : 'Node',  ,  _filter:null _filteruri: '', count: 1
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
