require('request')
const rq = require('request-promise-native')
const util = require('util')

// const objectAssign = require('object-assign');

module.exports = function (options) {
  'use strict'
  const config = {
    UserBase: 'http://www.smugmug.com/api/v2/user/',
    AlbumBase: 'http://www.smugmug.com/api/v2/album/',
    ImageBase: 'http://www.smugmug.com/api/v2/image/',
    FolderBase: 'http://www.smugmug.com//api/v2/folder',
    auth_user: 'http://www.smugmug.com/api/v2!authuser',
    username: '',
    api_key: '',
    albums_string: '!albums',
    images_string: '!images',
    image_string: '/image/'
  }

  var API = {},
    Parameters = {
      start: 1,
      count: 200
    }

  const rootURL = 'http://www.smugmug.com/'
  const Headers = {
    'User-Agent': 'request',
    'Accept': ' application/json',
    'Response': ' application/json'
  }

  if (options.username) {
    config.username = options.username
  }
  if (options.api_key) {
    config.api_key = options.api_key
  }

  function makeRequestOptions (base, params) {
    const apiKey = {APIKey: config.api_key}

    var url, queryParamas = Object.assign({}, apiKey, Parameters, params)

    switch (base) {
      case 'get-api':
        url = rootURL + '/api/v2'
        queryParamas = Object.assign({}, apiKey, params)
        break
      case 'connect':
        url = config.UserBase
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
        const URLs = body.Response.Uris
        for (var i in URLs) {
          API[i] = URLs[i].Uri
        }
        return API
      })
      .catch(function (err) {
        console.log(util.inspect(err, {showHidden: false, depth: null}))
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
        return err
      })
  }

  return {
    getAPI: getAPI,
    connect: connect
  }
}
