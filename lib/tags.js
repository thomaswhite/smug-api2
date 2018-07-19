'use strict'

module.exports.SumariseAlbum = function (albumTags, imageTags) {
  Object.keys(imageTags).forEach(function (tag) {
    if (typeof albumTags.existing[tag] !== 'undefined') {
      albumTags.existing[tag]++
    } else if (typeof albumTags.missing[tag] !== 'undefined') {
      albumTags.missing[tag]++
    } else {
      albumTags.missing[tag] = 1
    }
  })
  return albumTags
}

module.exports.album = function (album) {
  let tags = {UrlPath: album.UrlPath, existing: {}, missing: {}}
  album.Keywords.split(';').forEach(function (tag) {
    tag = tag.trim()
    if (tag) {
      tags.existing[tag] = 0
    }
  })
  return tags
}

module.exports.image = function (img) {
  let tags = {}
  img.Keywords.split(';').forEach(function (tag) {
    tag = tag.trim()
    if (tag) {
      tags[tag] = [img.ImageKey]
    }
  })
  return tags
}

module.exports.process_tags = function (o) {
  let tags = {Albums: {}, Images: {}}
  o.Keywords.split(';').forEach(function (tag) {
    tag = tag.trim()
    if (!tag) {
      return
    }
    if (o.AlbumKey) {
      tags.Albums[o.AlbumKey] = {}
    } else if (o.ImageKey) {
      tags[tag] = {ImageKey: [o.ImageKey]}
    }
  })
  return tags
}
