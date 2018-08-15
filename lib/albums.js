'use strict'

module.exports.ImageAdd = function (img, album) {
  if (!img.Movable) {
    album.ImagesCollected = album.ImagesCollected || []
    album.ImagesCollected.push(img.ImageKey)
  } else {
    album.Images = album.Images || []
    album.Images.push(img.ImageKey)
  }
  return album
}

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
