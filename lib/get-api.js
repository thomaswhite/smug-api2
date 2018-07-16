'use strict'

module.exports = function (options) {
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

  const DefaultParamaters = {
    start: 1,
    count: 200
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
        _filter: 'Name,NickName,WebUri',
        // _filteruri: 'Node',
        _expand: 'UserProfile',
        _expandmethod: 'inline'
      }],
      Albums: ['#UserBase', '$username', '!albums', {
        _filter: 'Name,Keywords,Description,ImagesLastUpdated,LastUpdated,NodeID,AlbumKey,SortIndex,Type,ImageCount,SortMethod,SecurityType,UrlPath',
        _filteruri: ''
      }],
      Profile: ['#UserBase', 'Suser', '!profile'],
      Bioimage: ['#UserBase', 'Suser', '!bioimage'],
      Coverimage: ['#UserBase', 'Suser', '!coverimage'],
      Authuser: ['api/v2', '!authuser'],
      Siteuser: ['api/v2', '!siteuser']
    },
    Image: {
      _filter: 'FileName,Keywords,Caption',
      _filteruri: '',
      metadata: ['#ImageBase', '$id', '!metadata']
    },
    Node: {
      Node: ['#NodeBase', '$NodeID', {
        _expand: 'ChildNodes',
        _filteruri: '',
        _filter: 'Name,Keywords,Description,Type,DateAdded,DateModified,IsRoot,NodeID,UrlPath,HasChildren'
      }], // _filteruri:'',  ,
      NodeCoverImage: ['#NodeBase', '$NodeID', '!cover'],
      Parents: ['#NodeBase', '$NodeID', '!parents'],
      ChildNodes: ['#NodeBase', '$AlbumKey', '!children', {
        _filteruri: ''
        // _filter: 'Name, Description, Keywords,Type,DateAdded,DateModified,NodeID,UrlPath'
      }]
    },

    Album: {
      Album: ['#AlbumBase', 'AlbumImages', {
        _filter: 'Name,Keywords,Description,ImagesLastUpdated,LastUpdated,NodeID,AlbumKey,SortIndex,Type',
        _filteruri: '',
        _expand: 'AlbumImages'
        // _expandmethod: 'inline'
      }],
      AlbumComments: ['#NodeBase', '$NodeID', '!comments'],
      AlbumHighlightImage: ['#AlbumBase', '$AlbumKey', '!highlightimage'],
      AlbumImages: ['#AlbumBase', '$AlbumKey', '!images', {
        _filter: 'Title,Caption,Keywords,FileName,Date,LastUpdated,ThumbnailUrl,ImageKey,Hidden',
        _filteruri: 'ImageSizes'
      }],
      HighlightImage: ['#HighlightBase', '$NodeID'],
      ParentFolders: ['#FolderBase', 'user', '$UserID', 'SmugMug/Prints!parents']
    }
  }

  function Credentials (credentials) {
    if (credentials) {
      config.username = credentials.username
      config.api_key = credentials.api_key
    }
  }

  function make_error (message, type, method) {
    return {
      ok: false,
      message: message,
      type: type + '/' + method
    }
  }


  function getUrl (typeMethod, oData, oExtraMethods) {
    oData = oData || {}
    oExtraMethods = oExtraMethods || {}

    const aType = typeMethod.split('/')
    const type = aType[0]
    const method = aType[1] || type

    if (!Obj[type]) { return make_error('function getUrl, unknown object type:' + type, type, method) }
    const obj = Object.assign({}, Obj[type])

    if (!obj[method]) { return make_error('function getUrl, unknown method:' + type + '/' + method, type, method) }
    const urlParts = Object.assign([], obj[method])
    let urlPramaters = {}

    for (let i = 0; i < urlParts.length; i++) {
      let step = urlParts[i]
      if (typeof step === 'string') {
        const firstLetter = step.substr(0, 1)
        const paramName = step.substr(1)
        switch (firstLetter) {
          case '#':
            if (!Urls[paramName]) { return make_error('function getUrl, unknown URL base:' + step, type, method) }
            step = Urls[paramName]
            break
          case '$':
            const param = oData[paramName] || config[paramName]
            if (!param) { return make_error('function getUrl, unknown parameter:' + step, type) }
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
    let qs = Object.assign({APIKey: config.api_key}, DefaultParamaters, urlPramaters, oExtraMethods)

    for (let j in qs) {
      if (qs[j] === null) {
        delete qs[j]
      }
    }

    return {
      ok: true,
      uri: urlParts.join('/'),
      qs: qs,
      headers: Headers,
      json: true,
      qsStringifyOptions: {encode: false}
    }
  }

  Credentials(options)

  return {
    obj: Obj,
    urls: Urls,
    getUrl: getUrl,
    credentials: Credentials
  }
}