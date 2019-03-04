'use strict'

import axios from '../../../plugins/axios'

const api = {
  uploadIcons
}

function uploadIcons (context, files) {
  return new Promise(function (resolve, reject) {
    const data = new FormData()
    let error = false
    files.forEach(file => {
      if (error) {
        return
      }
      if (!/\.svg$/.test(file.name)) {
        error = true
        reject({message: `File ${file.name} must be SVG.`})
        return
      }
      if (file.size > 102400) {
        error = true
        reject({message: `File ${file.name} must be less then 100 Kb`})
        return
      }
      data.append('icon[]', file)
    })
    if (error) {
      return
    }
    axios
      .request({
        url: '/api/iconsets/v4/upload',
        baseURL: process.env.apiUrl,
        method: 'post',
        data
      })
      .then(response => {
        if (response.data.success) {
          const icons = response.data.icon
          // decode svg
          icons.forEach(icon => {
            icon.svg = icon.svg ? atob(icon.svg) : icon.svg
            icon.imported = true
            icon.platform = 'color'
          })
          resolve(icons)
        } else {
          reject({message: response.data.message || 'Something went wrong'})
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

export default api
