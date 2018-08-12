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
  const PostcronAPI = require('./lib/postcron.js')

  //  const _ = require('lodash')
  // const deepmerge = require('deepmerge')
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

  function makeRequestOptions (base, params) {
    const apiKey = {APIKey: config.app_key}

    let url
    let queryParamas = Object.assign({}, apiKey, Parameters, params)

    switch (base) {
      case 'get-api':
        url = rootURL + '/api/v2'
        queryParamas = Object.assign({}, apiKey, params)
        break
      case 'connect':
        url = rootURL + API.urls.UserBase
        queryParamas = Object.assign({}, apiKey, params)
        break
      case '':
        url = config.UserBase
        break
    }

    return {
      uri: url,
      qs: queryParamas,
      headers: Headers,
      json: true
    }
  }

  function getAPI (options) {
    return rq(makeRequestOptions('get-api', Object.assign({}, options))) // , ,  {_filteruri:'AlbumBase'}
      .then(function (body) {
        if (options && options.raw === true) {
          return body.Response
        } else {
          const URLs = body.Response.Uris
          for (let i in URLs) {
            api[i] = URLs[i].Uri
          }
          return api
        }
      })
      .then(function (URLs) {
        if (options && options.save === true) {
          const FilePath = path.join(__dirname, 'lib/api-urls.json')
          fs.outputJson(FilePath, URLs)
            .then(function () {
              console.info(FilePath + ' has been saved')
            })
            .catch(function (err) {
              throw err
            })

          fs.writeFileSync(path.join(__dirname, 'lib/api-urls.json'), JSON.stringify(URLs, null, 2), 'utf-8')
        }
        return URLs
      })
      .catch(function (err) {
        throw err
      })
  }

  function connect (options) {
    return rq(makeRequestOptions('connect', Object.assign({}, {_filter: 'EndpointType', _filteruri: ''}, options)))
      .then(function (body) {
        //        console.log(body.Code)
        // console.log( util.inspect(body, {showHidden: false, depth: null})  );

        return body.Response
      })
      .catch(function (err) {
        throw err
      })
  }

  /* ======================================================== */

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
    let oImages = {IDs: {}, FileNames: {}}
    let KeyWords = {Albums: {}, Images: {}}
    let AllAlbums = {}
    let TitlesAndDescriptions = {}
    /*
        return fs.readJson(path.join(__dirname, 'data', 'Albums.json'))
          .then(function (savedAlbum) {
            return savedAlbum
          })
          .catch(function (err) {
            return null
          })
    */
    return User(oParam, oExtraMethods, 'Albums', postPayload)
      .then(function (aAlbums) {
        aAlbums.forEach(function (album) {
          TagsAPI.AddAlbumTags(album, KeyWords)
          AllAlbums[album.AlbumKey] = album
        })
        return aAlbums
      })

      /*
            .then(function (aAlbums) {
            let aRq = []
            aAlbums.forEach(function (fresh_album) {
              fresh_album.Images = {}
              fresh_album.filePath = path.join(__dirname, 'data', fresh_album.UrlPath, 'album.json')
              return fs.readJson( fresh_album.filePath)
                .then(function (savedAlbum) {
                  return {fresh: fresh_album, saved: savedAlbum}
                })
                .catch(function (err) {
                  return {fresh: fresh_album}
                })
                .then(function ( fresh_and_saved ) {
                  let album = fresh_and_saved.fresh
                  aRq.push(
                    Album(album, {}, 'AlbumImages')
                      .then(function (aImages) {
                        aImages.forEach(function (img) {
       */

      .then(function (aAlbums) {
        let aRq = []
        aAlbums.forEach(function (album) {
          aRq.push(
            Album(album, {}, 'AlbumImages')
              .then(function (aImages) {
                aImages.forEach(function (img) {
                  ImagesAPI.AddAlbum(img, album)
                  ImagesAPI.Add(img, oImages, TitlesAndDescriptions)
                  TagsAPI.AddImageTagsToAlbum(img, album, KeyWords)
                })
                let csv = PostcronAPI.makeCSV(aImages, 2018, 8, 1, 12, 0, 24, 3, 27, '1050x1050')

                return API.SaveJSON(album, album.UrlPath, 'Album.json')
                  .then(function (filePath) {
                    album.filePath = filePath
                    return {album: album, path: filePath, images: aImages, csv: csv}
                  })
                  .then(function (data) {
                    return API.SaveJSON(data.images, album.UrlPath, 'Images.json', '', aImages.length.toString().padStart(5) + ' images in ')
                      .then(function () {
                        return data
                      })
                  })
              })
          )
        })
        return Q.all(aRq)
      })

      .then(function (data) {
        let aRq = []
        data.forEach(function (AlbumData) {
          AlbumData.images.forEach(function (img) {
            // add image
            // process image tags
            // process folder tags
          })
          // save album
        })
        return data
      })

      .then(function (data) {
        let aRq = []
        TagsAPI.OrderAlbumTags(KeyWords)
        aRq.push(API.SaveJSON(KeyWords, '', 'KeyWords.json'))
        aRq.push(API.SaveJSON(oImages, '', 'Images.json'))
        aRq.push(API.SaveJSON(AllAlbums, '', 'Albums.json'))
        aRq.push(API.SaveJSON(TitlesAndDescriptions, '', 'Titles.json'))
        return Q.all(aRq)
      })
      .then(function () {
        console.log('AlbumsAndImages - all saved.')
      })

      .catch(function (err) {
        throw err
      })
  }

  function AlbumsAndImages2 (oParam, oExtraMethods, postPayload) {
    let oImages = {IDs: {}, FileNames: {}}
    let KeyWords = {Albums: {}, Images: {}}
    let AllAlbums = {}
    let TitlesAndDescriptions = {}

    return User(oParam, oExtraMethods, 'Albums', postPayload)
      .then(function (aAlbums) {
        aAlbums.forEach(function (album) {
          TagsAPI.AddAlbumTags(album, KeyWords)
          AllAlbums[album.AlbumKey] = album
        })
        return aAlbums
      })

      .then(function (aAlbums) {
        let aRq = []
        aAlbums.forEach(function (album) {
          aRq.push(
            Album(album, {}, 'AlbumImages')
              .then(function (aImages) {
                return {album: album, images: aImages}
              })
          )
        })
        return Q.all(aRq)
      })

      .then(function (AllAlbumsAndImages) {
        let aRq = []
        AllAlbumsAndImages.forEach(function (AlbumData) {
          // album
          // AlbumData.album

          // images
          AlbumData.images.forEach(function (img) {
            // add image
            // process image tags
            // process folder tags
          })

          // tags
          // csv
          // save album

          // return album, images, album tags, image tags, csv

          aRq.push(API.SaveJSON(AlbumData.album, album.UrlPath, 'Album.json'))
          aRq.push(API.SaveJSON(AlbumData.images, album.UrlPath, 'Images.json', '', aImages.length.toString().padStart(5) + ' images in '))

          return API.SaveJSON(album, album.UrlPath, 'Album.json')
            .then(function (filePath) {
              album.filePath = filePath
              return {album: album, path: filePath, images: aImages, csv: csv}
            })
            .then(function (data) {
              return API.SaveJSON(data.images, album.UrlPath, 'Images.json', '', aImages.length.toString().padStart(5) + ' images in ')
                .then(function () {
                  return data
                })
            })
        })
        return Q.all(aRq)

      })

      .then(function (data) {
        let aRq = []
        TagsAPI.OrderAlbumTags(KeyWords)
        aRq.push(API.SaveJSON(KeyWords, '', 'KeyWords.json'))
        aRq.push(API.SaveJSON(oImages, '', 'Images.json'))
        aRq.push(API.SaveJSON(AllAlbums, '', 'Albums.json'))
        aRq.push(API.SaveJSON(TitlesAndDescriptions, '', 'Titles.json'))
        return Q.all(aRq)
      })
      .then(function () {
        console.log('AlbumsAndImages - all saved.')
      })

      .catch(function (err) {
        throw err
      })
  }

  return {
    getAPI: getAPI,
    connect: connect,
    user: User,
    node: Node,
    album: Album,
    image: Image,
    AlbumsAndImages: AlbumsAndImages,
    AlbumsAndImages2: AlbumsAndImages2
  }
}
