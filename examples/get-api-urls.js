const creds = require('../lib/credentials.js')()
const util = require('util')
const ApiURL = require('../lib/get-api.js')(creds)

console.info('User/Profile\n', ApiURL.getUrl('User/Profile'), '\n')
console.info('Albumn', ApiURL.getUrl('Album', {AlbumKey: 'SJT3DX'}), '\n')
console.info('Album/AlbumImages', util.inspect(ApiURL.getUrl('Album/AlbumImages', {
  AlbumKey: 'SJT3DX',
  NodeID: 'ZsfFs'
}), {showHidden: false, depth: null}), '\n')
