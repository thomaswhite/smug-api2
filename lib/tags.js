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
      if (!tag) {
        let wtf = 1
      }
      if (typeof albumTags.existing[tag] !== 'undefined') {
        albumTags.existing[tag]++
      } else {
        albumTags.missing[tag] = albumTags.missing[tag] || 0
        albumTags.missing[tag]++
      }
    })
  }
}

function order (tags) {
  let ordered_tags = []
  Object.keys(tags).forEach(function (tag) {
    let current_value = tags[tag]
    let new_element = {value: current_value, name: tag}
    //  "windsor": 17,
    if (!ordered_tags.length) {
      ordered_tags.unshift(new_element)
    } else {
      for (let i = 0; i < ordered_tags.length; i++) {
        if (ordered_tags[i].value < current_value) {
          ordered_tags.splice(i, 0, new_element)
          break
        }
      }
    }
  })
  return ordered_tags
}

module.exports.OrderAlbumTags = function (oTags) {
  Object.keys(oTags.Albums).forEach(function (album_key) {
    let album = oTags.Albums[album_key]
    album.existing_ordered = order(album.existing)
    album.missing_ordered = order(album.missing)
  })
}



