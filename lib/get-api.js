'use strict'

module.exports = function (credentials, options) {
  'use strict'

  const config = {
    username: credentials.username,
    api_key: credentials.api_key
  }

  const sufixes = {
    albums: '!albums',
    images: '!images',
    image: '/image/',
    authuser: '!authuser'
  }

  const Headers = {
    'User-Agent': 'request',
    'Accept': ' application/json',
    'Response': ' application/json'
  }

  const rootURL = 'http://www.smugmug.com'

  const Urls = {
    UserBase: '/api/v2/user',
    AlbumBase: '/api/v2/album',
    AlbumTemplateBase: '/api/v2/albumtemplate',
    ThemeBase: '/api/v2/theme',
    TemplateBase: '/api/v2/template',
    ImageBase: '/api/v2/image',
    WatermarkBase: '/api/v2/watermark',
    PrintmarkBase: '/api/v2/printmark',
    FolderBase: '/api/v2/folder',
    CommentBase: '/api/v2/comment',
    PageBase: '/api/v2/page',
    StatusBase: '/api/v2/status',
    DownloadBase: '/api/v2/download',
    WebUriLookup: '/api/v2!weburilookup',
    GuideBase: '/api/v2/guide',
    NicknameUrlPathLookup: '/api/v2!nicknameurlpathlookup',
    NodeBase: '/api/v2/node',
    HighlightBase: '/api/v2/highlight/node',
    v2: '/api/v2'
  }

  const Obj = {
    User: {
      User: ['#UserBase', 'Susername'],
      Profile: ['#UserBase', 'Suser', '!profile'],
      Bioimage: ['#UserBase', 'Suser', '!bioimage'],
      Coverimage: ['#UserBase', 'Suser', '!coverimage'],
      Authuser: ['/api/v2', '!authuser'],
      Siteuser: ['/api/v2', '!siteuser']
    },
    Image: {
      _filter: 'FileName,Keywords,Caption',
      _filteruri: '',
      metadata: ['#ImageBase', '$id', '!metadata']
    },
    Node: {
      Node: ['#NodeBase', '$NodeID'],
      NodeCoverImage: ['#NodeBase', '$NodeID', '!cover'],
      Parents: ['#NodeBase', '$NodeID', '!parents']
    },
    Album: {
      Album: ['#AlbumBase', '$AlbumKey'],
      _filter: 'Name,Keywords,Description,ImagesLastUpdated,LastUpdated,NodeID,AlbumKey',
      _filteruri: '',

      AlbumComments: ['#NodeBase', '$NodeID', '!comments'],
      AlbumHighlightImage: ['#AlbumBase', '$AlbumKey', '!highlightimage'],
      AlbumImages: ['#NodeBase', '$NodeID', '!images'],
      HighlightImage: ['#HighlightBase', '$NodeID'],
      ParentFolders: ['#FolderBase', 'user', '$UserID', 'SmugMug/Prints!parents']
    }
  }

  function getUrl (type, subtype, oParam, oExtraSubTypes) {
    oExtraSubTypes = oExtraSubTypes || {}
    oParam = Object.assign({}, config, oParam)

    if (!Obj[type]) {
      throw new Error('function getUrl, unknown object type:' + type)
    }
    const obj = Object.assign({}, Obj[type], oExtraSubTypes)

    subtype = subtype || type
    if (!obj[subtype]) {
      throw new Error('function getUrl, unknown subtype:' + type + '/' + subtype)
    }
    const urlParts = Object.assign([], obj[subtype])

    for (let i = 0; i < urlParts.length; i++) {
      const step = urlParts[i]
      if (step.indexOf('#') === 0) {
        const base = Urls[step.substr(1)]
        if (!base) {
          throw new Error('function getUrl, unknown USL base:#' + step)
        }
        urlParts[i] = base
      }

      if (step.substr(0, 1) === '$') {
        const param = oParam[step.substr(1)]
        if (!param) {
          throw new Error('function getUrl, unknown parameter :$' + step)
        }
        urlParts[i] = param
      }
    }
    urlParts.unshift(rootURL)
    let Parameters = {}
    if (obj._filter) Parameters._filter = obj._filter
    if (obj._filteruri) Parameters._filter = obj._filteruri

    return {
      uri: urlParts.join('/'),
      qs: Object.assign({APIKey: config.api_key}, Parameters),
      headers: Headers,
      json: true
    }
  }

  return {
    obj: Obj,
    urls: Urls,
    getUrl: getUrl
  }
}
