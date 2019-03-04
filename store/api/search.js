'use strict'

import axios from '../../plugins/axios'

export default function search ({ rootState }, {
  term,
  platform = rootState.platform ? rootState.platform.apiCode : 'all',
  page = 1,
  amount = 100,
  language = rootState.i18n.locale,
  options = {}
} = {}) {
  return new Promise((resolve, reject) => {
    const _this = this
    const url = 'api/iconsets/v4/search'
    const params = {
      term,
      amount,
      offset: (page - 1) * amount,
      platform,
      language,
      ...options
    }
    const key = url + JSON.stringify(params)
    this.$apiCache.get(key)
      .then(data => {
        if (data) resolve(data)
        else fetch()
      })
      .catch(fetch)

    function fetch () {
      // if (process.env.NODE_ENV === 'production') {
      //   config.searchUrl = 'https://qs2.icons8.com:8030'
      // }
      axios
        .request({
          url,
          baseURL: process.env.searchUrl,
          method: 'get',
          params
        })
        .then(response => {
          if (response.data.icons) {
            const { icons, success, message, translations } = response.data
            _this.$apiCache.set(key, { icons, success, message, translations }, 60 * 60 * 24) // 48 hours
              .catch(error => {
                console.error(`Set apiCache error for key ${key}`, error.message)
              })
            resolve({ icons, success, message, translations })
          } else {
            reject('Server error')
          }
        })
        .catch(reject)
    }
  })
}
