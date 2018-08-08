'use strict'

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
