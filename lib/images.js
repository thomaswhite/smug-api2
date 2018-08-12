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

module.exports.Add = function (img, oImages, oTitles) {
  // img.urlPattern = ImageURLPattern(img)
  let oImage = oImages.IDs[img.ImageKey]
  if (oImage) {
    oImage.Albums = deepmerge(oImage.Albums, img.Albums)
  } else {
    oImages.IDs[img.ImageKey] = img
  }
  oImages.FileNames[img.FileName] = img.ImageKey
  return module.exports.TitlesAndDescriptions(img, oTitles)
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

module.exports.ProcessImage = function (img, album, oImages) {
  module.exports.Add(module.exports.addAlbum(img, album), oImages)
  return img
}
