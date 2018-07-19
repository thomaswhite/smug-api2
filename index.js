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

  function SaveJSON (oData, dir, filename) {
    const filePath = path.join(__dirname, dir, filename)
    return fs.outputJson(filePath, oData, {spaces: 2})
      .then(function () {
        console.log('%s saved', filePath)
      })
  }

  /* ======================================================== */

  function RequestSmug (RequestParameters, returnBody) {
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

  function User (oParam, oExtraMethods, method) {
    return RequestSmug(ApiURL.RequestParam('User', method, oParam, oExtraMethods))
  }

  function Node (oParam, oExtraMethods, method) {
    return RequestSmug(ApiURL.RequestParam('Node', method, oParam, oExtraMethods))
  }

  function Album (oParam, oExtraMethods, method) {
    return RequestSmug(ApiURL.RequestParam('Album', method, oParam, oExtraMethods))
  }

  function Image (oParam, oExtraMethods, method) {
    return RequestSmug(ApiURL.RequestParam('Image', method, oParam, oExtraMethods))
  }

  function ProcessImage (img, album) {
    let img2 = {Albums: {}}
    img2 = deepmerge(img2, img)
    if (!img2.Albums[album.AlbumKey]) {
      img2.Albums[album.AlbumKey] = []
    }
    img2.Albums[album.AlbumKey] = {UrlPath: album.UrlPath, Movable: img2.Movable}
    img2.urlPattern = ImageURLPattern(img)
    delete img2.ImageKey
    return img2
  }

  function ImageURLPattern (img) {
    // https://photos.smugmug.com/photos/i-g9RGWPS/0/61e9a465/Th/i-g9RGWPS-Th.jpg"
    return img.ThumbnailUrl.split(img.ImageKey)
      .join('$ImageKey')
      .replace(img.FileName.split('.')[0], '$fileNameBase')
      .replace('/Th', '/$Size')
      .replace('-Th', '-$Size')
  }

  function AlbumsAndImages (oParam, oExtraMethods) {
    let oImages = {IDs: {}, FileNames: {}}
    let KeyWords = {Albums: {}, Images: {}}
    let AllAlbums = {}
    return User(oParam, oExtraMethods, 'Albums')
      .then(function (aAlbums) {
        aAlbums.forEach(function (album) {
          KeyWords.Albums[album.AlbumKey] = album.tags = Tags.album(album)
          AllAlbums[album.AlbumKey] = album
        })
        return aAlbums
      })
      .then(function (aAlbums) {
        let aRq = []
        aAlbums.forEach(function (album) {
          album.Images = {}
          aRq.push(
            Album(album, {}, 'AlbumImages')
              .then(function (aImages) {
                aImages.forEach(function (img) {

                  oImages.IDs[img.ImageKey] = oImages.IDs[img.ImageKey] || {}
                  oImages.IDs[img.ImageKey] = deepmerge(oImages.IDs[img.ImageKey], ProcessImage(img, album))
                  oImages.FileNames[img.FileName] = img.ImageKey

                  const imageTags = Tags.image(img)
                  KeyWords.Images = deepmerge(KeyWords.Images, imageTags)

                  album.tags = Tags.SumariseAlbum(album.tags, imageTags)
                  album.Images[img.ImageKey] = img.FileName

                })
                // album.Images = aImages

                let sPath = path.join(__dirname, 'data', album.UrlPath, 'album.json')
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
      .then(function () {
        return SaveJSON(oImages, 'data', 'Images.json')
      })
      .then(function () {
        SaveJSON(KeyWords, 'data', 'KeyWords.json')
      })
      .then(function () {
        SaveJSON(AllAlbums, 'data', 'Albums.json')
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
    AlbumsAndImages: AlbumsAndImages
  }
}
