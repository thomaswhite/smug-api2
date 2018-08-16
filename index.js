// const objectAssign = require('object-assign');

module.exports = function (options, extraParameters) {
  'use strict'

  const Q = require('q')

  //  const util = require('util')
  // const fs = require('fs-extra')
  // const path = require('path')
  const API = require('./lib/api2.js')(options, extraParameters)
  const apiImages = require('./lib/images.js')
  const apiAlbums = require('./lib/albums.js')
  const apiPostcron = require('./lib/postcron.js')

  //  const _ = require('lodash')
  const deepmerge = require('deepmerge')
  //  rq.debug = true

  let config = {
    username: '',
    app_key: ''
  }

  let api = {}


  function isNotObject (obj) {
    return Object.keys(obj).length > 0
  }

  function User (oParam, oExtraMethods, method, postPayload) {
    return API.Request(API.RequestParam('User', method, oParam, oExtraMethods, postPayload))
  }

  function Node (oParam, oExtraMethods, method, postPayload) {
    return API.Request(API.RequestParam('Node', method, oParam, oExtraMethods, postPayload))
  }

  function Album (oParam, oExtraMethods, method, postPayload) {
    return API.Request(API.RequestParam('Album', method, oParam, oExtraMethods, postPayload))
  }

  function Image (oParam, oExtraMethods, method, postPayload) {
    return API.Request(API.RequestParam('Image', method, oParam, oExtraMethods, postPayload))
  }

  function AlbumsAndImages (oParam, oExtraMethods, postPayload) {
    return User(oParam, oExtraMethods, 'Albums', postPayload)
      .then(function (aAlbums) {
        let aRq = []
        console.log('%s albums fetched', aAlbums.length.toString().padEnd(5))
        aAlbums.forEach(function (album) {
          aRq.push(
            Album(album, {}, 'AlbumImages')
              .then(function (aImages) {
                console.log('%s images fetched in %s', aImages.length.toString().padEnd(5), album.UrlPath)
                return {album: album, images: aImages}
              })
          )
        })
        return Q.all(aRq)
      })
      .then(function (AllAlbumsAndImages) {
        let aRq = []
        AllAlbumsAndImages.forEach(function (Data) {
          apiAlbums.AddTags(Data)               // .tags
          Data.images.forEach(function (img) {
            apiImages.AddTitlesAndDescriptions(img, Data) // .title
            apiImages.AddAlbum(img, Data.album)
            apiAlbums.AddImage(img, Data.album)
            apiAlbums.AddImageTags(img, Data)
          })
          Data.postcron = apiPostcron.makeCSV(Data.images, 2018, 8, 1, 12, 0, 24, 3, 27, '1050x1050')
        })
        return AllAlbumsAndImages
      })

      .then(function (Data) {
        let aRq = []
        let All = {
          Tags: {},
          Images: {},
          Albums: {},
          Titles: {}
        }

        Data.forEach(function (data) {
          All.Tags = deepmerge(All.Tags, data.tags)
          All.Titles = deepmerge(All.Titles, data.titles)
          All.Albums[data.album.AlbumKey] = data.album

          data.images.forEach(function (img) {
            apiImages.Add(img, All.Images)
          })

          API.QueueMultipleJSONforSave(data, data.album.UrlPath, aRq)

        })

        API.QueueMultipleJSONforSave(All, '', aRq)
        return Q.all(aRq)
      })
      .then(function (data) {
        console.log('AlbumsAndImages - all saved.')
      })

      .catch(function (err) {
        throw err
      })
    //.done()
  }

  return {
    user: User,
    node: Node,
    album: Album,
    image: Image,
    AlbumsAndImages: AlbumsAndImages
  }
}
