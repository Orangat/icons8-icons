'use strict'

import axios from '../axios'

export default function suggest ({
  term, amount = 10, offset = 0, platform = 'all', language = 'en-US'
}) {
  return new Promise(function (resolve, reject) {
    axios
      .request({
        url: 'api/iconsets/v3/suggest',
        baseURL: process.env.apiUrl,
        method: 'get',
        params: {
          term,
          amount,
          offset,
          platform,
          language
        }
      })
      .then(response => {
        if (response.data.result && response.data.result.suggest) {
          let suggest = response.data.result.suggest
          if (suggest && suggest[1] && suggest[1].terms) {
            resolve(suggest[1].terms.map(option => {
              return option.term
            }))
          } else {
            resolve([])
          }
        } else {
          reject('Server error')
        }
      })
      .catch(reject)
  })
}
