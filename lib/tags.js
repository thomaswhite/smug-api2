'use strict'

function trimTags (s) {
  s = s || ''
  return s.trim().split('; ').join(';').split(' ;').join(';')
}

module.exports.trimTags = trimTags


function ImageAdd (img, oTags) {
  oTags.Images = oTags.Images || {}
  img.Keywords = trimTags(img.Keywords)
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

module.exports.AlbumAdd = function (album, oTags) {
  oTags.Albums = oTags.Albums || {}
  if (!oTags.Albums[album.AlbumKey]) {
    let tags = {UrlPath: album.UrlPath, existing: {}, missing: {}}
    oTags.Albums[album.AlbumKey] = tags
    album.Keywords = trimTags(album.Keywords)
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
  let oAlbumTags = module.exports.AlbumAdd(album, oTags)
  if (image.Keywords) {
    ImageAdd(image, oTags).forEach(function (tag) {
      tag = tag.trim()
      if (typeof oAlbumTags.existing[tag] !== 'undefined') {
        oAlbumTags.existing[tag]++
      } else {
        oAlbumTags.missing[tag] = oAlbumTags.missing[tag] || 0
        oAlbumTags.missing[tag]++
      }
    })
  }
}

/*
module.exports.ImageToAlbum = function (image, album, oTags) {
  let albumTags = module.exports.AlbumAdd(album, oTags)

  if (image.Keywords) {
    ImageAdd(image, oTags).forEach(function (tag) {
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
*/

function order (tags, SkipZeros) {
  let OrderedTags = []
  Object.keys(tags).forEach(function (tag) {
    if (!tags.hasOwnProperty(tag)) return
    let CurrentValue = tags[tag]
    if (SkipZeros && !CurrentValue) return
    let NewElement = {found: CurrentValue, tag: tag}
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

module.exports.OrderoAlbumTags = function (oTags) {
  Object.keys(oTags.Albums).forEach(function (AlbumKey) {
    if (!oTags.Albums.hasOwnProperty(AlbumKey)) return
    let album = oTags.Albums[AlbumKey]
    album.existing_ordered = order(album.existing, true)
    album.missing_ordered = order(album.missing)
  })
}
