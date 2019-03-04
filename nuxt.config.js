'use strict'

const defaultConfig = require('icons8-common/src/nuxt.defaults')
const config = Object.assign({}, defaultConfig)

const e = require('./env.js')
const env = Object.assign({}, e.default, e[process.env.NODE_ENV])

config.css = [
  { src: './assets/css/public.scss', lang: 'scss' }
]

config.plugins = [
  '~plugins/components',
  { src: '~plugins/infinite-scroll', ssr: false },
  { src: '~plugins/scrollTo', ssr: false }
]

console.log('env.redis', env.redis)

config.modules = [
  ['icons8-common/src/module.js', { redis: env.redis }]
]

config.favicon = [
  { size: 16, src: '/vue-static/icon/favicon.ico' },
  { size: 32, src: '/vue-static/icon/favicon.ico' },
  { size: 96, src: '/vue-static/icon/favicon.ico' },
  { size: 196, src: '/vue-static/icon/favicon.ico' }
]

module.exports = config
