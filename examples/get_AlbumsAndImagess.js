const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
const smug = require('../index.js')(creds, {count: 10})

smug.AlbumsAndImages()
  .then(function () {
    // console.log(util.inspect(data, {showHidden: false, depth: null}))
    console.log('AlbumsAndImages - done.')
  })
  .catch(function (err) {
    console.log(err)
  })
