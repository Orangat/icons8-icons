'use strict'

import axios from '~/plugins/axios'

export default function getSimilarIcons ({ rootState }, {
  id,
  amount = 24,
  language = rootState.i18n.locale
} = {}) {
  return new Promise((resolve, reject) => {
    const _this = this
    const url = '/api/iconsets/v4/similar'
    const params = {
      id,
      amount,
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
          const icons = response.data.icons || []
          _this.$apiCache.set(key, { icons }, 60 * 60 * 24) // 24 hours
          resolve({ icons })
        })
        .catch(reject)
    }
  })
}
