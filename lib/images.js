'use strict'

const Albums = require('./albums.js')
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

module.exports.TitlesAndDescriptions = function (img, oTitles) {
  let oT = {}
  let found = 0
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
  if (found && oTitles) {
    oTitles[img.ImageKey] = oT
  }
  return oT
}

module.exports.AddAlbum = function (img, album) {
  img.Albums = img.Albums || {}
  img.Albums[album.AlbumKey] = {UrlPath: album.UrlPath}
  if (!img.Movable) {
    img.Albums[album.AlbumKey].collected = true
  }
  Albums.AddImage(img, album)
  return img
}

module.exports.AlbumAdd = function (img, album) {
  if (img.Movable) {
    img.AlbumKey = album.AlbumKey
  } else {
    img.CollectedAlbums = img.CollectedAlbums || {}
    img.CollectedAlbums[album.AlbumKey] = album.UrlPath
  }
  return img
}
