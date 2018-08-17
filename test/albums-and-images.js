const vows = require('vows'),
  assert = require('assert'),
//  API = require('../lib/api2.js'),
//  creds = require('../lib/credentials.js')(),
  limit = 2

function getFirst (A) {
  return function (A) {
    return A[0]
  }
}

vows.describe('SmugMug API 2')
  .addBatch({
    'When we create smugmug object': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        return require('../index.js')(creds, {count: 2})
      },
      'we expect an object': function (topic) { assert.isObject(topic) },
      'we expect property user': function (topic) { assert.include(topic, 'user') },
      'we expect property node': function (topic) { assert.include(topic, 'node') },
      'we expect property album': function (topic) { assert.include(topic, 'album') },
      'we expect property image': function (topic) { assert.include(topic, 'image') },
      'we expect property AlbumsAndImages': function (topic) { assert.include(topic, 'AlbumsAndImages') },
    }
  })

  .addBatch({
    'When we get User Albums': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        const smug = require('../index.js')(creds, {count: limit})
        const that = this
        smug.user({}, {}, 'Albums') //_filter: 'AlbumKey,UrlPath'
          .then(function (data) { that.callback(null, data, smug) })
          .catch(function (err) { that.callback(err, null) })
      },
      'we do not expect error': function (err) { assert.isNull(err) },
      'we expect an array': function (err, aAlbums) { assert.isArray(aAlbums) },
      'we expect only limited number of albums': function (err, aAlbums) {
        assert.lengthOf(aAlbums, limit)
      },

      'AND when we check the first album': {
        topic: function (aAlbumsg) { return aAlbumsg[0] },
        'we expect an object': function (album) {
          assert.isObject(album)
        },
        'we expect property Name': function (album) {
          assert.include(album, 'Name')
        },
        'we expect property Keywords': function (album) { assert.include(album, 'Keywords') },
        'we expect property Description': function (album) { assert.include(album, 'Description') },
        'we expect property ImagesLastUpdated': function (album) { assert.include(album, 'ImagesLastUpdated') },
        'we expect property LastUpdated': function (album) { assert.include(album, 'LastUpdated') },
        'we expect property NodeID': function (album) { assert.include(album, 'NodeID') },
        'we expect property AlbumKey': function (album) { assert.include(album, 'AlbumKey') },
//        'we expect property SortIndex': function (album) { assert.include(album, 'SortIndex') },
        //       'we expect property Type': function (album) { assert.include(album, 'Type') },
        'we expect property ImageCount': function (album) { assert.include(album, 'ImageCount') },
        'we expect property SortMethod': function (album) { assert.include(album, 'SortMethod') },
        'we expect property SecurityType': function (album) { assert.include(album, 'SecurityType') },
        'we expect property UrlPath': function (album) { assert.include(album, 'UrlPath') }
      },

      'AND when we fetch the images of the first album': {
        topic: function (aAlbums, smug) {
          let that = this
          smug.album(aAlbums[0], {}, 'AlbumImages')
            .then(function (aImages) { that.callback(null, aImages) })
            .catch(function (err) { that.callback(err, null) })
        },
        'we do not expect error': function (err) { assert.isNull(err) },
        'we expected an array of images': function (err, aImages) { assert.isArray(aImages) },
        'we expect only limited number of images': function (err, aImages) { assert.lengthOf(aImages, limit) },
        'AND when we check the first image': {
          topic: function (aImages, aAlbums, smug) { return aImages[1] },
          'we expect an image to be an object': function (image) { assert.isObject(image) },
          'we expect property Title': function (image) { assert.include(image, 'Title') },
          'we expect property Caption': function (image) { assert.include(image, 'Caption') },
          'we expect property Keywords': function (image) { assert.include(image, 'Keywords') },
          'we expect property FileName': function (image) { assert.include(image, 'FileName') },
          'we expect property Date': function (image) { assert.include(image, 'Date') },
          'we expect property LastUpdated': function (image) { assert.include(image, 'LastUpdated') },
          'we expect property ThumbnailUrl': function (image) { assert.include(image, 'ThumbnailUrl') },
          'we expect property ImageKey': function (image) { assert.include(image, 'ImageKey') },
          'we expect property Movable': function (image) { assert.include(image, 'Movable') },
          'we expect property OriginalHeight': function (image) { assert.include(image, 'OriginalHeight') },
          'we expect property OriginalWidth': function (image) { assert.include(image, 'OriginalWidth') },
          'we expect property Collectable': function (image) { assert.include(image, 'Collectable') },
          'we expect property Hidden': function (image) { assert.include(image, 'Hidden') }

        }
      }
    }
  })

  .export(module)