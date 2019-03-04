'use strict'

import axios from '~/plugins/axios'

export default function latest ({ rootState }, {
  amount = 100,
  page = 1,
  platform = rootState.platform.apiCode,
  language = rootState.i18n.locale
} = {}) {
  return new Promise((resolve, reject) => {
    const _this = this
    const url = 'api/iconsets/v4/latest'
    const params = {
      amount,
      offset: (page - 1) * amount,
      platform,
      language
    }
    const key = url + JSON.stringify(params)
    this.$apiCache.get(key)
      .then(data => {
        if (data) resolve(data)
        else fetch()
      })
      .catch(fetch)

    function fetch () {
      axios
        .request({
          url,
          baseURL: process.env.apiUrl,
          method: 'get',
          params
        })
        .then(response => {
          const { icons, success, message } = response.data
          _this.$apiCache.set(key, { icons, success, message }, 60 * 60 * 2) // 2 hours
            .catch(error => {
              console.error(`Set apiCache error for key ${key}`, error.message)
            })
          resolve({ icons, success, message })
        })
        .catch(reject)
    }
  })
}
