'use strict'

import axios from '../../plugins/axios'

const api = {
  getPack,
  getSeoPack
}

function getPack ({ rootState }, {
  pack = rootState.pack.code,
  platform = rootState.platform.apiCode || 'all',
  amount = 100,
  page = 1,
  language = rootState.i18n.locale
} = {}) {
  return new Promise((resolve, reject) => {
    const _this = this
    const url = 'api/iconsets/v4/category'
    const params = {
      category: pack,
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
          const { category, success, message } = response.data
          _this.$apiCache.set(key, { category, success, message }, 60 * 60 * 24) // 24 hours
            .catch(error => {
              console.error(`Set apiCache error for key ${key}`, error.message)
            })
          resolve({ category, success, message })
        })
        .catch(reject)
    }
  })
}

function getSeoPack ({ rootState }, {
  pack = rootState.seoPack.code,
  platform = rootState.platform.apiCode,
  amount = 50,
  page = 1,
  language = rootState.i18n.locale
}) {
  return new Promise((resolve, reject) => {
    const _this = this
    const url = 'api/iconsets/v4/seoCategory'
    const params = {
      category: pack,
      amount,
      offset: (page - 1) * amount,
      platform: platform === 'all' ? undefined : platform,
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
          const { category, success, message } = response.data
          _this.$apiCache.set(key, { category, success, message }, 60 * 60 * 24) // 24 hours
            .catch(error => {
              console.error(`Set apiCache error for key ${key}`, error.message)
            })
          resolve({ category, success, message })
        })
        .catch(reject)
    }
  })
}

export default api
