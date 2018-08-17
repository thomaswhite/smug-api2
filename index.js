// const objectAssign = require('object-assign');

module.exports = function (options, extraParameters) {
  'use strict'

  const Q = require('q')

  //  const util = require('util')
  // const fs = require('fs-extra')
  // const path = require('path')
  const API = require('./lib/api2.js')(options, extraParameters)
  const ProcessData = require('./lib/process-data.js')

  //  const _ = require('lodash')
//  const deepmerge = require('deepmerge')
  //  rq.debug = true

//  function isNotObject (obj) {     return Object.keys(obj).length > 0   }

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
      .then(ProcessData.AlbumsAndImages)
      .then(ProcessData.Combine)
      .then(function (Data) {
        let aRq = API.QueueMultipleJSONforSave(Data.all, '')

        Data.AlbumsAndImages.forEach(function (data) {
          aRq = aRq.concat(API.QueueMultipleJSONforSave(data, data.album.UrlPath))
        })

        return Q.all(aRq)
      })
      .then(function (data) {
        console.log('AlbumsAndImages - all saved.')
        return data
      })
      .catch(function (err) {
        throw err
      })
  }

  return {
    user: User,
    node: Node,
    album: Album,
    image: Image,
    AlbumsAndImages: AlbumsAndImages
  }
}
