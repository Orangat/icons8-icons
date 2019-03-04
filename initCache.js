'use strict'
const axios = require('axios')
const fs = require('fs-extra')

const e = require('./env.js')
const env = Object.assign({}, e.default, e[process.env.NODE_ENV])

let appInfo
let seoPacksForCategories
let packsPreviews

console.log('init icons8 cache')
getAppInfo()
  // .then(getSeoPacksForCategories)
  // .then(saveSeoPacksForCategories)
  // .then(getPacksPreviews)
  // .then(savePacksPreviews)
  .then(saveAppInfo)
  .then(() => {
    console.log('icons8 cache completed')
    process.exit()
  })
  .catch(error => {
    console.log('init cache failed', error)
    process.exit(1)
  })

function getAppInfo () {
  return new Promise(function (resolve, reject) {
    if (appInfo) {
      resolve(appInfo)
      return
    }
    console.log('getting app info')
    axios
      .request({
        url: '/api/service/app-info',
        baseURL: env.apiUrl,
        method: 'get'
      })
      .then(response => {
        appInfo = response.data.result
        appInfo.styles = {
          outline: {
            title: 'Outline',
            code: 'outline'
          },
          line: {
            title: 'Line',
            code: 'line'
          },
          small: {
            title: 'Small',
            code: 'small'
          },
          colors: {
            title: 'Color',
            code: 'colors'
          }
        }
        appInfo.shapes = {
          round: {
            title: 'Round',
            code: 'round'
          },
          circle: {
            title: 'Circle',
            code: 'circle'
          },
          square: {
            title: 'Square',
            code: 'square'
          }
        }
        appInfo.colors = {
          black: {
            title: 'Black',
            code: 'black',
            value: '000000'
          },
          white: {
            title: 'White',
            code: 'white',
            value: 'ffffff'
          },
          blue: {
            title: 'Blue',
            code: 'blue',
            value: '4a90e2'
          },
          red: {
            title: 'Red',
            code: 'red',
            value: 'fa314a'
          },
          green: {
            title: 'Green',
            code: 'green',
            value: '26e07f'
          }
        }
        resolve(appInfo)
      })
      .catch(reject)
  })
}

function saveAppInfo () {
  // split whole appInfo in bunch of files
  const info = Object.assign({}, appInfo)
  info.packs.sort((a, b) => {
    if (a.title > b.title) {
      return 1
    }
    if (a.title < b.title) {
      return -1
    }
    return 0
  })
  // delete info.platforms
  // delete info.packs
  // delete info.seoPacks
  // delete info.activeLanguages
  console.log('saving app info')
  return fs.writeJson('./cache/appInfo.json', info, { spaces: 2 })
    .then(() => {
      return fs.writeJson('./cache/languages.json', appInfo.activeLanguages, { spaces: 2 })
    })
    .then(() => {
      return fs.writeJson('./cache/platforms.json', appInfo.platforms, { spaces: 2 })
    })
    .then(() => {
      return fs.writeJson('./cache/packs.json', appInfo.packs, { spaces: 2 })
    })
    .then(() => {
      return fs.writeJson('./cache/seoPacks.json', appInfo.seoPacks, { spaces: 2 })
    })
}

function getSeoPacksForCategories () {
  return new Promise((resolve, reject) => {
    if (seoPacksForCategories) {
      resolve(seoPacksForCategories)
      return
    }
    console.log('getting seo packs info')
    axios
      .request({
        url: '/api/categories-info',
        baseURL: env.searchUrl,
        method: 'get'
      })
      .then(response => {
        seoPacksForCategories = response.data.platforms
        resolve(seoPacksForCategories)
      })
      .catch(reject)
  })
}

function saveSeoPacksForCategories (seoPacksForCategories) {
  console.log('saving seo packs info')
  appInfo.seoPacksForCategories = Object.assign({}, seoPacksForCategories)
}

const promiseSerial = (functions) =>
  functions.reduce((promise, func) =>
    promise.then(result => func().then(Array.prototype.concat.bind(result))),
  Promise.resolve([]))

function getPacksPreviews () {
  return new Promise(function (resolve, reject) {
    if (packsPreviews) {
      resolve(packsPreviews)
      return
    }
    const promises = []
    console.log('getting packs previews')
    // https://devapi.icons8.com/api/iconsets/v4/category?category=free-icons&amount=100&offset=0&platform=ios11&language=en-US
    Object.keys(appInfo.platforms).forEach((id, i) => {
      if (id === 'all') {
        return
      }
      // if (i > 2) {
      //   return
      // }
      appInfo.platforms[id].packs.forEach((pack, i) => {
        // if (i > 2) {
        //   return
        // }
        promises.push(() => {
          console.log(`getting previews for ${id} ${pack}`)
          return new Promise(function (resolve, reject) {
            setTimeout(() => {
              axios
                .request({
                  url: '/api/iconsets/v4/category',
                  baseURL: env.apiUrl,
                  method: 'get',
                  params: {
                    category: pack,
                    amount: 16,
                    offset: 0,
                    platform: id,
                    language: 'en-US'
                  }
                })
                .then(response => {
                  resolve(Object.assign({ platform: id, pack }, response.data))
                })
                .catch(reject)
            }, 100)
          })
        })
      })
    })
    promiseSerial(promises)
      .then(response => {
        resolve(response)
      })
      .catch(reject)
  })
}

function savePacksPreviews (responses) {
  console.log('saving packs previews')
  console.log('responses[0]', responses[0])
  packsPreviews = {}
  responses.forEach(previews => {
    const platform = previews.platform
    const pack = previews.pack
    console.log('platform', platform)
    console.log('pack', pack)
    packsPreviews[platform] = packsPreviews[platform] || {}
    packsPreviews[platform][pack] =
      []
        .concat
        .apply([], previews.category.subcategory.map(subcategory => subcategory.icons))
        .filter(icon => !icon.filled)
        .filter((icon, i) => i < 8)
        .map(icon => icon.commonName)
  })
  appInfo.packsPreview = packsPreviews
  return fs.writeJson('./cache/packsPreviews.json', packsPreviews, { spaces: 2 })
}
