const vows = require('vows'),
  assert = require('assert'),
  API = require('../lib/api2.js'),
  creds = require('../lib/credentials.js')()
//  , smug = require('../index.js')(creds)

vows.describe('SmugMug API 2')
  .addBatch({
    'When we get credentials': {
      topic: function () {
        return require('../lib/credentials.js')()
      },
      'we ecpect an object': function (topic) {
        assert.isObject(topic)
      },
      'we expect property username': function (topic) {
        assert.include(topic, 'username')
      },
      'we expect property app_key': function (topic) {
        assert.include(topic, 'app_key')
      },
      'we expect property app_secret': function (topic) {
        assert.include(topic, 'app_secret')
      }
    },
    'When we pass a Username': {
      topic: function () {
        return require('../lib/credentials.js')({username: 'some-other-username'})
      },
      'we expect this name in the credentials': function (topic) {
        assert.equal(topic.username, 'some-other-username')
      }
    }
  })

  .addBatch({
    'When we create smugmug object': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        return require('../index.js')(creds, {count: 2})
      },
      'we ecpect an object': function (topic) { assert.isObject(topic) },
      'we expect property user': function (topic) { assert.include(topic, 'user') },
      'we expect property node': function (topic) { assert.include(topic, 'node') },
      'we expect property album': function (topic) { assert.include(topic, 'album') },
      'we expect property image': function (topic) { assert.include(topic, 'image') },
      'we expect property AlbumsAndImages': function (topic) { assert.include(topic, 'AlbumsAndImages') },
    }
  })

  .addBatch({
    'When we get Smugmug User Albums': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        const smug = require('../index.js')(creds, {count: 2})
        const that = this
        smug.user({}, {_filter: 'AlbumKey,UrlPath'}, 'Albums')
          .then(function (data) {
            that.callback(null, data)
          })
          .catch(function (err) {
            that.callback(err, null)
          })
      },
      'we expect an array': function (topic) {
        assert.isArray(topic)
        assert.lengthOf(topic, 2)
      }
    }
  })

  .export(module)