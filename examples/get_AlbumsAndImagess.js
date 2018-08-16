const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
const smug = require('../index.js')(creds, {count: 5})

smug.AlbumsAndImages()
  .then(function () {
    // console.log(util.inspect(data, {showHidden: false, depth: null}))
    console.log('get_AlbumsAndImagess - done.')
  })
  .catch(function (err) {
    console.log(err)
  })
