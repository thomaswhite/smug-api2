'use strict'

const deepmerge = require('deepmerge')

module.exports.ImageURLPattern = function (img, size) {
  // https://photos.smugmug.com/photos/i-g9RGWPS/0/61e9a465/Th/i-g9RGWPS-Th.jpg"
  size = size || '$Size'
  return img.ThumbnailUrl
  //    .split(img.ImageKey).join('$ImageKey')
    .replace(img.FileName.split('.')[0], '$fileNameBase')
    .replace('/Th', '/' + size)
    .replace('-Th', '-' + size)
}

module.exports.Add = function (img, oImages) {
  // img.urlPattern = ImageURLPattern(img)
  if (!oImages.IDs) { oImages.IDs = {} }
  let oImage = oImages.IDs[img.ImageKey]
  if (oImage) {
    if (img.AlbumKey) { oImage.AlbumKey = img.AlbumKey }
    oImage.CollectedAlbums = deepmerge({}, oImage.CollectedAlbums, img.CollectedAlbums)
  } else {
    oImages.IDs[img.ImageKey] = img
  }
  if (!oImages.FileNames) {
    oImages.FileNames = {}
  }
  oImages.FileNames[img.FileName] = img.ImageKey
}

module.exports.AddTitlesAndDescriptions = function (img, oData) {
  let oT = {}
  let found = 0

  if (!oData.titles) { oData.titles = {} }
  if (img.Title) {
    oT.Title = img.Title
    found++
  }
  if (img.Caption) {
    oT.Caption = img.Caption
    found++
  }
  if (img.Keywords) {
    oT.Keywords = img.Keywords
    found++
  }
  if (found) {
    oData.titles[img.ImageKey] = oT
  }
}

module.exports.AddAlbum = function (img, album) {
  if (img.Movable) {
    img.AlbumKey = album.AlbumKey
  } else {
    img.CollectedAlbums = img.CollectedAlbums || {}
    img.CollectedAlbums[album.AlbumKey] = album.UrlPath
  }
  return img
}
