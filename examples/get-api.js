// const util = require('util')
const creds = require('../lib/credentials.js')()
const smug = require('../index.js')(creds)
// const fs = require('fs-extra')
// const path = require('path')

// const get_api_url = require('../lib/get-api.js')(creds)
// console.info( "User", get_api_url.getUrl('Node', {NodeID:'SgX7vW'}), "\n" );

smug.userAlbums()
  .then(function (data) {
    // console.log(util.inspect(data, {showHidden: false, depth: null}))
    console.log('userAlbums - done.')
  })
  .catch(function (err) {
    console.log(err)
  })

/*
smug.user('Albums', {}, {}) // , _filteruri: null,  _filter: null
  .then(function (data) {
    data.Album.forEach(function (o) {
      console.log('%s %s, %i images', o.Name.padEnd(20), o.UrlPath.padEnd(30), o.ImageCount.toString().padStart(4))
    })
    return [fs.outputJson(path.join(__dirname, '../data/albums.json'), data.Album, {spaces: 2}), data.Album]
    //console.log(util.inspect(data, {showHidden: false, depth: null}))
//    return smug.node('ChildNodes', {NodeID: data.NodeID})
  })
  .then(function (aData) {
    console.log(util.inspect(aData[1], {showHidden: false, depth: null}))
  })

  .catch(function (err) {
    console.log(err)
  })
*/

/*
smug.album('AlbumImages', {AlbumKey: 'Fg96T2'}, {_filteruri:'' }) //   _filteruri:'AlbumImages'   _filter: 'Name,NickName,WebUri',  : 'Node',  ,  _filter:null
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })
*/


/*

let User;
let rootFolders;
smug.user()
  .then(function (data) {
    User = data
    console.log(util.inspect(data, {showHidden: false, depth: null}))
    return smug.node('ChildNodes', {NodeID: data.NodeID})
  })
  .then(function (data) {
    rootFolders = data
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })

  .catch(function (err) {
    console.log(err)
  })

smug.node(null, {NodeID: 'SgX7vW'})
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })

/*
smug.node('ChildNodes', {NodeID: 'SgX7vW'}, {})
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
  })
  .catch(function (err) {
    console.log(err)
  })

smug.user()
  .then(function (data) {
    console.log(util.inspect(data, {showHidden: false, depth: null}))
    return data
  })
  .then(function (User) {
//     let uri = User.Uris.Node.Uri
//     let Node = User.Uris.Node.split('/')[4]

  })
  .catch(function (err) {
    console.log(err)
  })
*/

// console.info( "User,Profile" , get_api_url.getUrl('User/Profile'), "\n" )
// console.info( "Album" , util.inspect( get_api_url.getUrl('Album', { AlbumKey: 'SJT3DX' }) , {showHidden: false, depth: null}), "\n" )
// console.info( "Album/AlbumImages" , util.inspect( get_api_url.getUrl('Album/AlbumImages', { AlbumKey: 'SJT3DX', NodeID:'ZsfFs' }) , {showHidden: false, depth: null}), "\n" )
