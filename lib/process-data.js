'use strict'

const deepmerge = require('deepmerge')
// const fs = require('fs-extra')
// const path = require('path')

// const apiTags = require('./tags.js')
const apiImages = require('./images.js')
const apiAlbums = require('./albums.js')
const apiPostcron = require('./postcron.js')

var OneAlbumAndImages = module.exports.OneAlbumAndImages = function (Data) {
  apiAlbums.AddTags(Data)               // .tags
  Data.images.forEach(function (img) {
    apiImages.AddTitlesAndDescriptions(img, Data) // .title
    apiImages.AddAlbum(img, Data.album)
    apiAlbums.AddImage(img, Data.album)
    apiAlbums.AddImageTags(img, Data)
  })
  Data.postcron = apiPostcron.makeCSV(Data.images, 2018, 8, 1, 12, 0, 24, 3, 27, '1050x1050')
  return Data
}

module.exports.AlbumsAndImages = function (AllAlbumsAndImages) {
  AllAlbumsAndImages.forEach(OneAlbumAndImages)
  return AllAlbumsAndImages
}

module.exports.Combine = function (AllAlbumsAndImages) {
  let All = {
    Tags: {},
    Images: {},
    Albums: {},
    Titles: {}
  }

  AllAlbumsAndImages.forEach(function (data) {
    All.Tags = deepmerge(All.Tags, data.tags)
    All.Titles = deepmerge(All.Titles, data.titles)
    All.Albums[data.album.AlbumKey] = data.album
    data.images.forEach(function (img) {
      apiImages.Add(img, All.Images)
    })
  })
  return {all: All, AlbumsAndImages: AllAlbumsAndImages}
}

