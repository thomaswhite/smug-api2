const vows = require('vows')
const assert = require('assert')
// API = require('../lib/api2.js'),
// creds = require('../lib/credentials.js')()
//  , smug = require('../index.js')(creds)

vows.describe('Module test_credentials.js')
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
  .export(module)
