/* eslint-disable no-template-curly-in-string */

// https://github.com/shouldjs/should.js

'use strict'

// const util = require('util')
const fs = require('fs-extra')
const path = require('path')

const should = require('should')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const it = lab.test
const test = lab.text
const describe = lab.experiment

const api = {
  UserBase: '/api/v2/user',
  AlbumBase: '/api/v2/album',
  AlbumTemplateBase: '/api/v2/albumtemplate',
  ThemeBase: '/api/v2/theme',
  TemplateBase: '/api/v2/template',
  ImageBase: '/api/v2/image',
  WatermarkBase: '/api/v2/watermark',
  PrintmarkBase: '/api/v2/printmark',
  FolderBase: '/api/v2/folder',
  CommentBase: '/api/v2/comment',
  PageBase: '/api/v2/page',
  StatusBase: '/api/v2/status',
  DownloadBase: '/api/v2/download',
  NicknameUrlPathLookup: '/api/v2!nicknameurlpathlookup',
  WebUriLookup: '/api/v2!weburilookup',
  GuideBase: '/api/v2/guide'
}

const app_keys = [
  'UserBase', 'AlbumBase', 'AlbumTemplateBase', 'ThemeBase', 'TemplateBase', 'ImageBase', 'WatermarkBase', 'PrintmarkBase', 'FolderBase', 'CommentBase', 'PageBase', 'StatusBase', 'DownloadBase', 'NicknameUrlPathLookup', 'WebUriLookup', 'GuideBase'
]

// const beforeEach = lab.beforeEach

const credentials = require('../lib/credentials.js')()

describe('smug-api2 unit tests', function () {
  describe('get-api URLS', function () {
    const API = require('../lib/get-api.js')

    it('returns object', function () {
      API.should.be.an.instanceOf(Object)
    })
    it('has properties', function () {
      API.should.have.property('sufixes')
      API.should.have.property('urls')
    })
    it('has expected urls', function () {
      API.urls.should.be.eql(api)
    })
  })

  describe('smug object', function () {
    const smug = require('../index.js')(credentials)

    it('returns object', function () {
      smug.should.be.an.instanceOf(Object)
    })
    it('has methods', function () {
      smug.getAPI.should.be.instanceOf(Function)
      smug.connect.should.be.instanceOf(Function)
    })
  })

  describe('smug methods', function () {
    const smug = require('../index.js')(credentials)

    it('method .getAPI returns object', function () {
      smug.getAPI()
        .then(function (data) {
          data.should.be.an.instanceOf(Object)
            .and.eql(api)
          return data
        })
        .catch(function (err) {
          console.log(err)
        })
    })

    it('method .getAPI should save URLs as JSON file', function () {
      const FilePath = path.join(__dirname, '../lib/api-urls.json')

      fs.remove(path.join(FilePath), function () {})
      smug.getAPI({save: true})
        .then(function (data) {
          fs.readJson(FilePath)
            .then(function (data2) {
              data2.should.be.an.instanceOf(Object)
                .and.eql(api)

              for (let i = 1; i < app_keys.length; i++) {
                data2.should.have.key(app_keys[i], 'check for key' + app_keys[i])
              }

            })
            .catch(function (err) {
              should.not.exist(err)
            })
        })
        .catch(function (err) {
          should.not.exist(err)
        })
    })

    it('method .connect returns object', function () {
      smug.connect()
        .then(function (data) {
          data.should.have.property('EndpointType', 'UserBase')
        })
        .catch(function (err) {
          console.log(err)
        })
    })
  })
})
