// const objectAssign = require('object-assign');

module.exports = function (options) {
  'use strict'

  require('any-promise/register/q')
  const Q = require('q')
  const rq = require('request-promise-any')

  const util = require('util')
  const fs = require('fs-extra')
  const path = require('path')
  const get_api_url = require('./lib/get-api.js')(options)

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
            .then(function (data) {
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
    return rq(get_api_url.getUrl(!method ? 'User' : 'User' + '/' + method, oParam, oExtraMethods))
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
    if (method) {
      type += '/' + method
    }
    let oRQ = get_api_url.getUrl(type, oParam, oExtraMethods)
    return rq(oRQ)
      .then(function (body) {
        //let User = body.Response.User
        //User.Node = User.Uris.Node.split('/')[4]
        return body.Response.Node
      })
      .catch(function (err) {
        throw err
      })
  }

  function Album (method, oParam, oExtraMethods) {
    let type = 'Album'
    if (method) {
      type += '/' + method
    }
    return rq(get_api_url.getUrl(type, oParam, oExtraMethods))
      .then(function (body) {
        return body.Response.AlbumImage
      })
      .catch(function (err) {
        throw err
      })
  }

  function userAlbums () {
    return User('Albums')
      .then(function (aAlbums) {
        let aRq = []
        aAlbums.Album.forEach(function (o) {
          aRq.push(
            Album('AlbumImages', o)
              .then(function (aImages) {
//              aImages.forEach(function (f) {
//                console.log(f.FileName)
//              })
                console.log('%s, %i images downloaded', o.UrlPath, aImages.length)
                // return [fs.outputJson(path.join(__dirname, '../data/albums.json'), data.Album, {spaces: 2}), data.Album]
                return {images: aImages, album: o}
              })
          )
        })

        return Q.all(aRq)
      })
      .then(function (results) {
        console.log('Done', results[0].length)
        return results
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
