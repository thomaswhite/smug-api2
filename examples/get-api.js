const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)

//const get_api_url = require('../lib/get-api.js')(creds)
//console.info( "User", get_api_url.getUrl('Node', {NodeID:'SgX7vW'}), "\n" );

smug.node({NodeID: 'SgX7vW'})
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })

/*
smug.user()
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
    return data.Response.User
  })
  .then(function (User) {
     let uri = User.Uris.Node.Uri
     let Node = User.Uris.Node.split('/')[4]

  })
  .catch(function (err) {
    console.log(err)
  })
*/

//console.info( "User,Profile" , get_api_url.getUrl('User/Profile'), "\n" )
//console.info( "Album" , util.inspect( get_api_url.getUrl('Album', { AlbumKey: 'SJT3DX' }) , {showHidden: false, depth: null}), "\n" )
// console.info( "Album/AlbumImages" , util.inspect( get_api_url.getUrl('Album/AlbumImages', { AlbumKey: 'SJT3DX', NodeID:'ZsfFs' }) , {showHidden: false, depth: null}), "\n" )

