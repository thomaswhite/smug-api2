'use strict'

const Tags = require('./tags.js')
const deepmerge = require('deepmerge')

function ProcessImage (img, album) {
  let img2 = deepmerge({Albums: {}}, img)
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

function AddToImages (img, album) {

  img.Albums = {}
  img.Albums[album.AlbumKey] = [{UrlPath: album.UrlPath, Movable: img.Movable}]
  img.urlPattern = ImageURLPattern(img)

  let o = {
    IDs: {},
    FileNames: {}
  }
  o.IDs[img.ImageKey] = img
  o.FileNames[img.FileName] = img.ImageKey

  return o
}

/*
// add to oImages
oImages.IDs[img.ImageKey] = oImages.IDs[img.ImageKey] || {}
oImages.IDs[img.ImageKey] = deepmerge(oImages.IDs[img.ImageKey], Images.Process(img, album))
oImages.FileNames[img.FileName] = img.ImageKey

// Add to Tags
const imageTags = Tags.image(img)
KeyWords.Images = deepmerge(KeyWords.Images, imageTags)

// Add to the album
album.tags = Tags.SumariseAlbum(album.tags, imageTags)
album.Images[img.ImageKey] = img.FileName

*/

function ImageTags (img) {
  return Tags.image(img)
}

module.exports = {
  Process: ProcessImage,
  ImageURLPattern: ImageURLPattern,
  ImageTags: ImageTags,
  AddToImages: AddToImages
}

