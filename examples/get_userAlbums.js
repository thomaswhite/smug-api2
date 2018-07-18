const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

smug.userAlbums()
  .then(function () {
    // console.log(util.inspect(data, {showHidden: false, depth: null}))
    console.log('userAlbums - done.')
  })
  .catch(function (err) {
    console.log(err)
  })
