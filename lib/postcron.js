'use strict'

const fs = require('fs-extra')
const path = require('path')
const images = require('./images.js')

// Text,Year,Month,Day,Hour,Minutes,Image URL,Link

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max)) * (Math.floor(Math.random() * 2 + 0.2) == 1 ? 1 : -1)
}

module.exports.makeCSV = function (aImages, Year, Month, Day, Hours, Minutes, HoursDelay, DeviationHours, DeviationMinutes, size) {

  let Rows = aImages.map(function (img, index) {
    let date = new Date(Year, Month, Day, Hours, Minutes, 0)
    let h = Hours + HoursDelay * index + getRandomInt(DeviationHours)
    let m = Minutes + getRandomInt(DeviationMinutes) + 1
    date.setHours(h)
    date.setMinutes(m)

    return [
      // img.Caption + ' \n' + img.Keywords,
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      images.ImageURLPattern(img, size)
    ].join(',')

//    Caption
//    Keywords
  })

  return Rows
}
