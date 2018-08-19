const vows = require('vows')
const assert = require('assert')
const limit = 2

vows.describe('SmugMug API 2')
  .addBatch({
    'When we create smugmug object': {
      topic: function () {
        const creds = require('../lib/credentials.js')() // {username: 'stuckincustoms'}
        return require('../index.js')(creds, {count: limit})
      },
      'we expect an object': function (topic) { assert.isObject(topic) },
      'we expect property user': function (topic) { assert.include(topic, 'user') },
      'we expect property node': function (topic) { assert.include(topic, 'node') },
      'we expect property album': function (topic) { assert.include(topic, 'album') },
      'we expect property image': function (topic) { assert.include(topic, 'image') },
      'we expect property AlbumsAndImages': function (topic) { assert.include(topic, 'AlbumsAndImages') }
    }
  })
  .export(module)
