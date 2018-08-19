const vows = require('vows')
const assert = require('assert')
const limit = 2

vows.describe('User Albums')
  .addBatch({
    'When we get User': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        const smug = require('../index.js')(creds, {count: limit})
        const that = this
        smug.user('User', {}, {}) //  filter: 'AlbumKey,UrlPath'
          .then(function (data) { that.callback(null, data, smug) })
          .catch(function (err) { that.callback(err, null) })
      },
      'we do not expect error': function (err, User) { assert.isNull(err) },
      'we expect property NickName': function (User) { assert.include(User, 'NickName') },
      'we expect property Name': function (User) { assert.include(User, 'Name') },
      'we expect property Uri': function (User) { assert.include(User, 'Uri') },
      'we expect property WebUri': function (User) { assert.include(User, 'WebUri') },
      'we expect property NodeID': function (User) { assert.include(User, 'NodeID') }
    }
  })

  .addBatch({
    'When we get User Albums': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        const smug = require('../index.js')(creds, {count: limit})
        const that = this
        smug.user('Albums', {}, {}) // _filter: 'AlbumKey,UrlPath'
          .then(function (data) { that.callback(null, data, smug) })
          .catch(function (err) { that.callback(err, null) })
      },
      'we do not expect error': function (err, aAlbums) { assert.isNull(err) },
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
          smug.album('AlbumImages', aAlbums[0], {})
            .then(function (aImages) { that.callback(null, aImages) })
            .catch(function (err) {
              process.stderr.write('Unexpected error', err)
              that.callback(err, null)
            })
        },
        'we do not expect error': function (err, aImages) { assert.isNull(err) },
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
