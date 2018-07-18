// const objectAssign = require('object-assign');

module.exports = function (options) {
  'use strict'

  require('any-promise/register/q')
  const Q = require('q')
  const rq = require('request-promise-any')

  //  const util = require('util')
  const fs = require('fs-extra')
  const path = require('path')
  const ApiURL = require('./lib/get-api.js')(options)
  const Tags = require('./lib/tags.js')
  //  const _ = require('lodash')
  const deepmerge = require('deepmerge')
  //  rq.debug = true

  let config = {
    username: '',
    api_key: ''
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
    const apiKey = {APIKey: config.api_key}

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

  function User (method, oParam, oExtraMethods) {
    return rq(ApiURL.getUrl(!method ? 'User' : 'User' + '/' + method, oParam, oExtraMethods))
      .then(function (body) {
        //       let User = body.Response.User
        //       User.NodeID = User.Uris.Node.Uri.split('/')[4]
        //       delete User.Uris
        return body.Response
      })
      .catch(function (err) {
        throw err
      })
  }

  function Node (method, oParam, oExtraMethods) {
    let type = 'Node'
    if (method) { type += '/' + method }
    let oRQ = ApiURL.getUrl(type, oParam, oExtraMethods)
    return rq(oRQ)
      .then(function (body) {
        // let User = body.Response.User
        // User.Node = User.Uris.Node.split('/')[4]
        return body.Response.Node
      })
      .catch(function (err) {
        throw err
      })
  }

  function Album (method, oParam, oExtraMethods) {
    let type = 'Album'
    if (method) { type += '/' + method }
    return rq(ApiURL.getUrl(type, oParam, oExtraMethods))
      .then(function (body) {
        return body.Response.AlbumImage
      })
      .catch(function (err) {
        throw err
      })
  }

  function ProcessImage (img, album) {
    let img2 = {Albums: {}}
    img2 = deepmerge(img2, img)
    img2.Albums[album.AlbumKey] = album.UrlPath
    delete img2.FileName
    return img2
  }

  function ImageURLPattern (img) {
    return img.ThumbnailUrl.split(img.ImageKey)
      .join('$ImageKey')
      .replace(img.FileName.split('.')[0], '$fileNameBase')
      .replace('/Th', '/$Size')
      .replace('-Th', '-$Size')
  }

  function userAlbums () {
    let oImages = {}
    let KeyWords = {Albums: {}, Images: {}}
    let AllAlbums
    return User('Albums')

      .then(function (aAlbums) {
        let aRq = []
        AllAlbums = deepmerge({}, aAlbums.Album)
        aAlbums.Album.forEach(function (album) {
          let AlbumTags = Tags.process_album_tags(album)
          KeyWords.Albums[album.AlbumKey] = AlbumTags
          album.tags = AlbumTags
          aRq.push(
            Album('AlbumImages', album)
              .then(function (aImages) {
                let sPath = path.join(__dirname, 'data', album.UrlPath, 'album.json')
                aImages.forEach(function (img) {
                  img.urlPattern = ImageURLPattern(img)

                  oImages[img.FileName] = oImages[img.FileName] || {}
                  oImages[img.FileName] = deepmerge(oImages[img.FileName], ProcessImage(img, album))

                  const imageTags = Tags.process_image_tags(img)
                  KeyWords.Images = deepmerge(KeyWords.Images, imageTags)
                  Tags.sumarise_albumTags(AlbumTags, imageTags)
                })
                album.Images = aImages
                return fs.outputJson(sPath, album, {spaces: 2})
                  .then(function () {
                    console.log('%s images in %s', aImages.length.toString().padStart(5), sPath)
                    return {album: album, path: sPath}
                  })
              })
          )
        })
        return Q.all(aRq)
      })
      .then(function (results) {
        let imagesPath = path.join(__dirname, 'data', 'Images.json')
        return fs.outputJson(imagesPath, oImages, {spaces: 2})
          .then(function () {
            const filePath = path.join(__dirname, 'data', 'KeyWords.json')
            console.log('%s saved', imagesPath)
            return fs.outputJson(filePath, KeyWords, {spaces: 2})
              .then(function () {
                console.log('%s saved', filePath)
              })
          })
          .then(function () {
            const filePath = path.join(__dirname, 'data', 'Albums.json')
            return fs.outputJson(filePath, AllAlbums, {spaces: 2})
              .then(function () {
                console.log('%s saved', filePath)
              })
          })
          .then(function () {
            return [results, oImages, AllAlbums]
          })
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
    userAlbums: userAlbums
  }
}
