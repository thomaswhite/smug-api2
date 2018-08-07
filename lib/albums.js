'use strict'

module.exports.AddImage = function (img, album) {
  album.Images = album.Images || {}
  album.Images[img.ImageKey] = {}
  if (!img.Movable) { album.Images[img.ImageKey].collected = true }
  return album
}


