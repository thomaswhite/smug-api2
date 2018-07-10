/* eslint-disable no-template-curly-in-string */

// https://github.com/shouldjs/should.js

'use strict'

require('should')

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const it = lab.test
const describe = lab.experiment
// const beforeEach = lab.beforeEach

const credentials = require('../examples/credentials.js')()

describe('smug-api2 unit tests', function () {
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

      smug.getAPI()
        .then(function (data) {
          data.should.be.an.instanceOf(Object)
            .and.eql(api)
//                .and.have.property('UserBase', '/api/v2/user')
          //flags.note( data )
        })
        .catch(function (err) {
          console.log(err)
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

/*

var test = require('tape')


test('Is function', function (t) {
  ['getAPI', 'connect'].forEach(function (impl) {
    t.equal(typeof smug[impl], 'function')
  })
  t.end()
})



test('Default is Safer', function (t) {
  t.equal(index, safer)
  t.notEqual(safer, dangerous)
  t.notEqual(index, dangerous)
  t.end()
})

test('Is not a function', function (t) {
  [index, safer, dangerous].forEach(function (impl) {
    t.equal(typeof impl, 'object')
    t.equal(typeof impl.Buffer, 'object')
  });
  [buffer].forEach(function (impl) {
    t.equal(typeof impl, 'object')
    t.equal(typeof impl.Buffer, 'function')
  })
  t.end()
})

humble.albums.get()
.then(function(res){
	console.log('albums().get then()')
	console.log(res.Albums.length)
})
.catch(function(error){
	console.log("Caught the error")
	console.error(error);
});

humble.albums.list()
.then(function(res){
	console.log('album.list()')
	console.log(res.Albums.length)
	for(var i=0; i<res.Albums.length; i++){
		// console.log(i)
		if(res.Albums[i].ImageCount>0){
			// if(res.Albums[i].ImageCount>6){
			// 	console.log(res.Albums[i].Title)
			// 	console.log(res.Albums[i].key)
			// }

				humble
				.album({key: res.Albums[i].key})
				.images()
				.list({count:200, start:1})
				.then(function(res){
					// console.log(res.Images.length);
					// if(res.Images.length>1){
					// 	for(var i=0; i<res.Images.length; i++){
					// 		console.log(res.Images[i])
					// 		console.log("arr "+res.Images[i].Sizes.MediumImageUrl)
					// 	}

					// }
					// console.log('album().images().list()')
				})
				.catch(function(error){
					console.error(error);
				})
		}else{
			continue
		}
	}
})
.catch(function(error){
	console.log("Caught the error")
	console.error(error);
})

humble.image({key:'THQLx2X-0'}).sizes()
.then(function(res){
	console.log('image().sizes()');
	// console.log(res);
})

humble.image({key:'THQLx2X-0'}).get()
.then(function(res){
	console.log('image().get()');
	// console.log(res.Image);
})

//Step 1 Request User Info from URI
//http://www.smugmug.com/api/v2/user/teerlinkcabinet

//Step 2 Request User Albums URI
//http://www.smugmug.com/api/v2/user/teerlinkcabinet!albums

//Step 3 Request all Photos within each album

//Step 4

*/
