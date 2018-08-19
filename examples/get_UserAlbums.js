const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds, {count: 2})

smug.user('Albums', {}, {_filter: 'AlbumKey,UrlPath'}) // , _filteruri: null,  _filter: null
  .then(function (data) {
    /*
        data.forEach(function (o) {
    /    console.log('%s %s, %i images', o.Name.padEnd(35), o.UrlPath.padEnd(30), o.ImageCount.toString().padStart(4))
    //  })
    */
    console.log(data)
    return data
  })

  .catch(function (err) {
    console.log(err)
  })
