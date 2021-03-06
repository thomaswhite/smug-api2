'use strict'

require('any-promise/register')('q')
// const Q = require('q')
const rq = require('request-promise-any') //  https://www.npmjs.com/package/request-promise

const fs = require('fs-extra')
const path = require('path')

module.exports = function (options, extraParameters) {
  'use strict'

  let config = {}
  /*
  const sufixes = {
    albums: '!albums',
    images: '!images',
    image: '/image/',
    authuser: '!authuser'
  }
*/
  const Headers = {
    'User-Agent': 'request',
    'Accept': ' application/json',
    'Response': ' application/json'
  }

  let DefaultParamaters = {
    start: 1,
    count: 25,
    _shorturis: '',
    _verbosity: 1
  }

  const ImageSizes = {
    '100x100': 'Th',
    '150x150': 'Th',
    '400x300': 'S',
    '600x450': 'M',
    '800x600': 'L',
    '1024x768': 'XL',
    '1280x960': 'X2',
    'Original': 'O',
    '1000x1000': '1000x1000!'
  }

  const rootURL = 'http://www.api.smugmug.com'

  const Urls = {
    UserBase: 'api/v2/user',
    AlbumBase: 'api/v2/album',
    AlbumTemplateBase: 'api/v2/albumtemplate',
    ThemeBase: 'api/v2/theme',
    TemplateBase: 'api/v2/template',
    ImageBase: 'api/v2/image',
    WatermarkBase: 'api/v2/watermark',
    PrintmarkBase: 'api/v2/printmark',
    FolderBase: 'api/v2/folder',
    CommentBase: 'api/v2/comment',
    PageBase: 'api/v2/page',
    StatusBase: 'api/v2/status',
    DownloadBase: 'api/v2/download',
    WebUriLookup: 'api/v2!weburilookup',
    GuideBase: 'api/v2/guide',
    NicknameUrlPathLookup: 'api/v2!nicknameurlpathlookup',
    NodeBase: 'api/v2/node',
    HighlightBase: 'api/v2/highlight/node',
    v2: 'api/v2'
  }

  const Obj = {
    User: {
      User: ['#UserBase', '$username', {
        _filter: 'Name,NickName,WebUri,Uri,',
        _filteruri: 'Node',
        _expand: 'UserProfile',
        _expandmethod: 'inline'
      }],
      Albums: ['#UserBase', '$username', '!albums', {
        _filter: 'Name,Keywords,Description,ImagesLastUpdated,LastUpdated,NodeID,AlbumKey,ImageCount,SortMethod,SecurityType,UrlPath,SquareThumbs', // ,SortIndex,Type
        _filteruri: ''
      }],
      AlbumsTimeStamps: ['#UserBase', '$username', '!albums', {
        _filter: 'ImagesLastUpdated,LastUpdated,AlbumKey,UrlPath',
        _filteruri: ''
      }],
      Profile: ['#UserBase', '$username', '!profile'],
      Bioimage: ['#UserBase', '$username', '!bioimage'],
      Coverimage: ['#UserBase', '$username', '!coverimage'],
      Authuser: ['api/v2', '!authuser'],
      Siteuser: ['api/v2', '!siteuser']
    },

    // Folder:

    Node: {
      Node: ['#NodeBase', '$NodeID', {
        //  expand: 'ChildNodes',
        _filteruri: '',
        _filter: 'Name,Keywords,Description,Type,DateAdded,DateModified,NodeID,UrlPath,HasChildren,SortIndex,SortDirection,SortMethod'
      }], // _filteruri:'',  ,
      NodeCoverImage: ['#NodeBase', '$NodeID', '!cover'],
      Parents: ['#NodeBase', '$NodeID', '!parents'],
      ChildNodes: ['#NodeBase', '$NodeID', '!children', {
        _filteruri: ''
        // _filter: 'Name, Description, Keywords,Type,DateAdded,DateModified,NodeID,UrlPath'
      }]
    },

    Image: {
      Image: ['#ImageBase', '$ImageKey', {
        _filter: 'FileName,Keywords,Title,Caption,Collectable,ThumbnailUrl,Date,LastUpdated,ImageKey,Keywords,OriginalHeight,OriginalWidth',
        _filteruri: 'ImageAlbum'
      }]
    },

    Album: {
      Album: ['#AlbumBase', '$AlbumKey', {
        _filter: 'Name,Keywords,Description,ImagesLastUpdated,LastUpdated,NodeID,AlbumKey,Type,SquareThumbs,SortIndex,SortDirection,SortMethod,UrlPath,ImageCount',
        _filteruri: '',
        _expand: 'AlbumImages',
        returnRoot: 'Album'
        // _expandmethod: 'inline'
      }],
      AlbumComments: ['#NodeBase', '$NodeID', '!comments'],
      AlbumHighlightImage: ['#AlbumBase', '$AlbumKey', '!highlightimage'],
      AlbumImages: ['#AlbumBase', '$AlbumKey', '!images', {
        _filter: 'Title,Caption,Keywords,FileName,Date,LastUpdated,ThumbnailUrl,ImageKey,Hidden,Movable,OriginalHeight,OriginalWidth,Collectable',
        _filteruri: ''
      }],
      HighlightImage: ['#HighlightBase', '$NodeID'],
      ParentFolders: ['#FolderBase', 'user', '$UserID', 'SmugMug/Prints!parents']
    }
  }

  function MakeError (message, type, method) {
    return {
      ok: false,
      message: message,
      type: type + '/' + method
    }
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

  function RequestParam (type, method, oData, oExtraMethods, postPayload) {
    oData = oData || {}
    oExtraMethods = oExtraMethods || {}
    method = method || type

    if (!Obj[type]) { return MakeError('function RequestParam, unknown object type:' + type, type, method) }
    const obj = Object.assign({}, Obj[type])

    if (!obj[method]) { return MakeError('function RequestParam, unknown method:' + type + '/' + method, type, method) }
    const urlParts = Object.assign([], obj[method])
    let urlPramaters = {}

    for (let i = 0; i < urlParts.length; i++) {
      let step = urlParts[i]
      if (typeof step === 'string') {
        const firstLetter = step.substr(0, 1)
        const paramName = step.substr(1)
        switch (firstLetter) {
          case '#':
            if (!Urls[paramName]) { return MakeError('function RequestParam, unknown URL base:' + step, type, method) }
            step = Urls[paramName]
            break
          case '$':
            const param = oData[paramName] || config[paramName]
            if (!param) { return MakeError('function RequestParam, unknown parameter:' + step, type) }
            step = param
            break
        }
        urlParts[i] = step
      } else {
        urlPramaters = Object.assign({}, urlPramaters, step)
        delete urlParts[i]
      }
    }
    urlParts.unshift(rootURL)
    let qs = Object.assign({APIKey: config.app_key}, DefaultParamaters, urlPramaters, oExtraMethods)

    let result = {
      ok: true,
      uri: urlParts.join('/'),
      qs: qs,
      headers: Headers,
      json: true,
      qsStringifyOptions: {encode: false}
    }
    if (postPayload) {
      result.body = postPayload
    }

    Object.keys(qs).forEach(function (j) {
      if (j === 'method') {
        result.method = qs[j]
        delete qs[j]
      } else if (qs[j] === null) {
        delete qs[j]
      }
    })

    return result
  }

  function SaveJSON (oData, dir, filename, prefix, suffix) {
    prefix = prefix || ''
    suffix = suffix || ''
    const filePath = path.join(__dirname, '..', 'data', config.username, dir, filename)
    return fs.outputJson(filePath, oData, {spaces: 2})
      .then(function () {
        console.log('%s %s %s', prefix, filePath, suffix)
        return filePath
      })
  }

  function QueueMultipleJSONforSave (O, dir) {
    let aQueue = []
    for (var key in O) {
      if (O.hasOwnProperty(key)) {
        aQueue.push(SaveJSON(O[key], dir, key + '.json', '', O[key].length || Object.keys(O[key]).length))
      }
    }
    return aQueue
  }

  function Credentials (credentials) {
    if (credentials) {
      config.username = credentials.username
      config.app_key = credentials.app_key
      config.app_secret = credentials.app_secret
    }
  }

  DefaultParamaters = Object.assign({}, DefaultParamaters, extraParameters)
  Credentials(options)

  return {
    obj: Obj,
    urls: Urls,
    Request: RequestSmug,
    RequestParam: RequestParam,
    credentials: Credentials,
    SaveJSON: SaveJSON,
    QueueMultipleJSONforSave: QueueMultipleJSONforSave
  }
}
