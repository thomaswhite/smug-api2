// const objectAssign = require('object-assign');

module.exports = function (options, extraParameters) {
  'use strict'

  require('any-promise/register/q')
  const Q = require('q')
  const rq = require('request-promise-any')  //  https://www.npmjs.com/package/request-promise

  //  const util = require('util')
  const fs = require('fs-extra')
  const path = require('path')
  const API = require('./lib/api2.js')(options, extraParameters)
  const TagsAPI = require('./lib/tags.js')
  const ImagesAPI = require('./lib/images.js')
  const AlbumsAPI = require('./lib/albums.js')
  const PostcronAPI = require('./lib/postcron.js')

  //  const _ = require('lodash')
  const deepmerge = require('deepmerge')
  //  rq.debug = true

  let config = {
    username: '',
    app_key: ''
  }

  let api = {}
  let Parameters = {
    start: 1,
    count: 200
  }

  const rootURL = 'http://www.smugmug.com'
  const Headers = {
    'User-Agent': 'request',
    'Accept': ' application/json',
    'Response': ' application/json'
  }

  function isNotObject (obj) {
    return Object.keys(obj).length > 0
  }

  function RequestSmug (RequestParameters, returnBody) {
    // resolveWithFullResponse: true
    // simple: false
    return rq(RequestParameters)
      .then(function (body) {
        let data = body.Response.Locator
          ? body.Response[body.Response.Locator]
          : body.Response

        if (data.Keywords && typeof data.Keywords !== 'string') {
          data.Keywords = data.Keywords.join(';')
        }
        if (data.KeywordArray && data.KeywordArray.length) {
          if (!data.Keywords) {
            data.Keywords = data.KeywordArray.join(';')
          }
          delete data.KeywordArray
        }
        return returnBody === true ? body : data
      })
      .catch(function (err) {
        throw err
      })
  }

  function User (oParam, oExtraMethods, method, postPayload) {
    return RequestSmug(API.RequestParam('User', method, oParam, oExtraMethods, postPayload))
  }

  function Node (oParam, oExtraMethods, method, postPayload) {
    return RequestSmug(API.RequestParam('Node', method, oParam, oExtraMethods, postPayload))
  }

  function Album (oParam, oExtraMethods, method, postPayload) {
    return RequestSmug(API.RequestParam('Album', method, oParam, oExtraMethods, postPayload))
  }

  function Image (oParam, oExtraMethods, method, postPayload) {
    return RequestSmug(API.RequestParam('Image', method, oParam, oExtraMethods, postPayload))
  }

  function AlbumsAndImages (oParam, oExtraMethods, postPayload) {
    return User(oParam, oExtraMethods, 'Albums', postPayload)
      .then(function (aAlbums) {
        let aRq = []
        aAlbums.forEach(function (album) {
          aRq.push(
            Album(album, {}, 'AlbumImages')
              .then(function (aImages) {
                console.log('Downloaded %d5 images in %s', aImages.length, album.UrlPath)
                return {album: album, images: aImages}
              })
          )
        })
        return Q.all(aRq)
      })

      .then(function (AllAlbumsAndImages) {
        let aRq = []
        AllAlbumsAndImages.forEach(function (Data) {
          Data.tags = {}
          Data.titles = {}
          TagsAPI.AlbumAdd(Data.album, Data.tags)
          Data.images.forEach(function (img) {
            ImagesAPI.AlbumAdd(img, Data.album)
            ImagesAPI.TitlesAndDescriptions(img, Data.titles)
            AlbumsAPI.ImageAdd(img, Data.album)
            TagsAPI.ImageToAlbumAdd(img, Data.album, Data.tags)
          })
          Data.postcron = PostcronAPI.makeCSV(Data.images, 2018, 8, 1, 12, 0, 24, 3, 27, '1050x1050')

          // return album, images, album tags, image tags, postcron

          aRq.push(
            API.SaveJSON(Data.album, Data.album.UrlPath, 'Album.json')
              .then(function () { return Data })
              .then(function (data) {
                return API.SaveJSON(Data.images, data.album.UrlPath, 'Images.json', '', data.images.length.toString().padStart(5) + ' images')
                  .then(function () { return data })
              })
              .then(function (data) {
                return API.SaveJSON(Data.postcron, data.album.UrlPath, 'Postcron.json').then(function () { return data })
              })
              .then(function (data) {
                return API.SaveJSON(Data.tags, data.album.UrlPath, 'Tags.json').then(function () { return data })
              })
              .then(function (data) {
                return API.SaveJSON(Data.titles, data.album.UrlPath, 'Titles.json').then(function () { return data })
              })
          )
        })
        return Q.all(aRq)
      })

      .then(function (data) {
        let All = {
          Tags: {},
          Images: {},
          Albums: {},
          Titles: {}
        }

        data.forEach(function (Data) {
          All.Tags = deepmerge(All.Tags, Data.tags)
          All.Titles = deepmerge(All.Titles, Data.titles)

          Data.images.forEach(function (img) {
            ImagesAPI.Add(img, All.Images)
          })

          All.Albums[Data.album.AlbumKey] = Data.album
        })

        let aRq = []
        // TagsAPI.OrderAlbumTags(All.Tags)
        aRq.push(API.SaveJSON(All.Tags, '', 'Tags.json'))
        aRq.push(API.SaveJSON(All.Images, '', 'Images.json'))
        aRq.push(API.SaveJSON(All.Albums, '', 'Albums.json'))
        aRq.push(API.SaveJSON(All.Titles, '', 'Titles.json'))
        return Q.all(aRq)
      })
      .then(function (data) {
        console.log('AlbumsAndImages - all saved.')
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
