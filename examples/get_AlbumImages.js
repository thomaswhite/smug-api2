const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.album('AlbumImages', {AlbumKey: 'Fg96T2'}, {_filteruri: '', count: 1}) // _filter:null,   _filteruri:'AlbumImages'   _filter: 'Name,NickName,WebUri',  : 'Node',  ,  _filter:null
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
