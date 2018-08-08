'use strict'

const Albums = require('./albums.js')
const deepmerge = require('deepmerge')

function ImageURLPattern (img) {
  // https://photos.smugmug.com/photos/i-g9RGWPS/0/61e9a465/Th/i-g9RGWPS-Th.jpg"
  return img.ThumbnailUrl.split(img.ImageKey)
    .join('$ImageKey')
    .replace(img.FileName.split('.')[0], '$fileNameBase')
    .replace('/Th', '/$Size')
    .replace('-Th', '-$Size')
}

module.exports.Add = function (img, oImages) {
  img.urlPattern = ImageURLPattern(img)
  let oImage = oImages.IDs[img.ImageKey]
  if (oImage) {
    oImage.Albums = deepmerge(oImage.Albums, img.Albums)
  } else {
    oImages.IDs[img.ImageKey] = img
  }
  oImages.FileNames[img.FileName] = img.ImageKey
  return img
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
