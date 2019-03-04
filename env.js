'use strict'

const port = process.env.PORT || 3033

const env = {
  default: {
    port,
    project: `icon`,
    host: `localhost:${port}`,
    apiUrl: 'https://api.icons8.com',
    backendUrl: 'https://icons8.com',
    language: `en-US`,
    searchUrl: 'https://search.icons8.com',
    iconsUrl: 'https://img.icons8.com',
    redis: false,
    redisHost: '127.0.0.1',
    redisPort: 6379
  },
  dev: {
    redis: false,
    staticUrl: 'https://dev.icons8.com'
  },
  production: {
    staticUrl: 'https://maxst.icons8.com'
  }
}

module.exports = env
