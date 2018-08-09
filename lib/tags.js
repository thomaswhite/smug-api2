'use strict'

module.exports.AddImageTags = function (img, oTags) {
  oTags.Images = oTags.Images || {}
  let ImagesTags = oTags.Images
  let tags = img.Keywords.split(';')
  tags.forEach(function (tag) {
    tag = tag.trim()
    if (tag) {
      ImagesTags[tag] = ImagesTags[tag] || {}
      ImagesTags[tag][img.ImageKey] = 1
    }
  })
  return tags
}

module.exports.AddAlbumTags = function (album, oTags) {
  oTags.Albums = oTags.Albums || {}
  if (!oTags.Albums[album.AlbumKey]) {
    let tags = {UrlPath: album.UrlPath, existing: {}, missing: {}}
    oTags.Albums[album.AlbumKey] = tags
    album.Keywords.split(';').forEach(function (tag) {
      tag = tag.trim()
      if (tag) {
        tags.existing[tag] = 0
      }
    })
  }
  return oTags.Albums[album.AlbumKey]
}

module.exports.AddImageTagsToAlbum = function (image, album, oTags) {
  let albumTags = module.exports.AddAlbumTags(album, oTags)

  if (image.Keywords) {
    module.exports.AddImageTags(image, oTags).forEach(function (tag) {
      tag = tag.trim()
      if (typeof albumTags.existing[tag] !== 'undefined') {
        albumTags.existing[tag]++
      } else {
        albumTags.missing[tag] = albumTags.missing[tag] || 0
        albumTags.missing[tag]++
      }
    })
  }
}

function order (tags, SkipZeros) {
  let OrderedTags = []
  Object.keys(tags).forEach(function (tag) {
    let CurrentValue = tags[tag]
    if (SkipZeros && !CurrentValue) return
    let NewElement = {found: CurrentValue, name: tag}
    //  "windsor": 17,
    if (!OrderedTags.length) {
      OrderedTags.unshift(NewElement)
    } else {
      for (let i = 0; i < OrderedTags.length; i++) {
        if (OrderedTags[i].found < CurrentValue) {
          OrderedTags.splice(i, 0, NewElement)
          return
        }
      }
      OrderedTags.push(NewElement)
    }
  })
  return OrderedTags
}

module.exports.OrderAlbumTags = function (oTags) {
  Object.keys(oTags.Albums).forEach(function (AlbumKey) {
    let album = oTags.Albums[AlbumKey]
    album.existing_ordered = order(album.existing, true)
    album.missing_ordered = order(album.missing)
  })
}
