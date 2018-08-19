//const creds = require('../lib/credentials.js')()
//  const smug = require('../index.js')(creds)

const path = require('path')
const fs = require('fs-extra')
/*
smug.user('AlbumsTimeStamps', {}, {}) // , _filteruri: null,  _filter: null
  .then(function (data) {
    console.log(data)
    data.forEach(function (o) {
      //console.log('%s %s, %i images', o.Name.padEnd(35), o.UrlPath.padEnd(30), o.ImageCount.toString().padStart(4))
    })
    console.log(data)
    return data
  })

  .catch(function (err) {
    console.log(err)
  })

*/
let oSaved = null
let sAlbumsPath = path.join(__dirname, '../data', 'Albums.json')

fs.readJson(sAlbumsPath)
  .then(function (savedAlbums) {
    oSaved = savedAlbums
    return savedAlbums
  })
  .catch(function (err) {
    return null
  })
  .then(function (savedAlbums) {
    return savedAlbums
    //  smug.user(savedAlbums ? 'AlbumsTimeStamps' : 'Albums', {}, {})
  })

  .then(function (freshAlbums) {
    if (!oSaved) {
      return freshAlbums
    } else {
      let ToFetch = []
      freshAlbums.forEach(function (album) {
        let add = false
        let saved = oSaved[album.AlbumKey]
        if (saved.LastUpdated !== album.LastUpdated) {
          album._fetchAlbum = true
          add = true
        }
        if (saved.ImagesLastUpdated !== album.ImagesLastUpdated) {
          album._fetchImages = true
          add = true
        }
        if (add) { ToFetch.push(album) }
      })
      return ToFetch
    }
  })
  .then(function (ToFetch) {
    console.log(ToFetch)
  })

  .catch(function (err) {
    console.log(err)
  })
