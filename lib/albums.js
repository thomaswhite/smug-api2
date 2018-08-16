'use strict'

const apiTags = require('./tags.js')

module.exports.AddTags = function (Data) {
  if (!Data.tags) { Data.tags = {} }
  apiTags.AlbumAdd(Data.album, Data.tags)
}

module.exports.AddImage = function (img, album) {
  if (!img.Movable) {
    album.ImagesCollected = album.ImagesCollected || []
    album.ImagesCollected.push(img.ImageKey)
  } else {
    album.Images = album.Images || []
    album.Images.push(img.ImageKey)
  }
  return album
}

module.exports.AddImageTags = function (img, oData) {
  if (!oData.tags) { oData.tags = {} }
  apiTags.AddImageTagsToAlbum(img, oData.album, oData.tags)
}

/*
module.exports.Tags = function (album) {
  let tags = {UrlPath: album.UrlPath, existing: {}, missing: {}}
  album.Keywords.split(';').forEach(function (tag) {
    tag = tag.trim()
    if (tag) {
      tags.existing[tag] = 0
    }
  })
  return tags
}

*/