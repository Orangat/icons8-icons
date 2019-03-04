'use strict'

import axios from '~/plugins/axios'
import iconUtils from '~/plugins/iconUtils'
import fileSaver from 'file-saver'

import { getIconContentBySVG } from '../api/icon/download'

const download = {
  downloadCollection,
  generateFont,
  generateIconSet
}

function downloadCollection ({ icons, name, format, color, size, isSimplified }) {
  return new Promise(function (resolve, reject) {
    import(/* webpackChunkName: "collections" */ 'jszip')
      .then(result => {
        const JSZip = result.default
        const zip = new JSZip()
        const promises = []
        const uniqueNames = new iconUtils.UniqueNames()
        icons.forEach(function (icon) {
          let promise = getContent(icon)
            .then(content => {
              let iconName = iconUtils.normalizeValue(icon.name)
              if (icon.filled && !iconName.endsWith('-filled')) {
                iconName += '-filled'
              }
              if (icon.size) {
                iconName += '-' + icon.size
              }
              let name = uniqueNames.getName(iconName)
              if (!name.startsWith('icons8')) {
                name = `icons8-${name}`
              }
              return zip.file(`${name}.${format}`, content)
            })
          if (promise) {
            promises.push(promise)
          }
        })
        Promise.all(promises)
          .then(() => {
            return zip.generateAsync({ type: 'blob' })
          })
          .then(blob => fileSaver.saveAs(blob, (name || 'Icons8') + '.zip'))
          .then(resolve)
          .catch(reject)
      })
      .catch(reject)
  })

  function getContent (icon) {
    return new Promise(function (resolve, reject) {
      const iconSize = icon.size || size
      // process png
      if (format === 'png' && icon.iconId && !icon.imported && !icon.svgEffect) {
        axios
          .request({
            url: '/',
            baseURL: process.env.iconsUrl,
            method: 'get',
            params: {
              id: icon.iconId,
              size: iconSize,
              color
            },
            responseType: 'blob'
          })
          .then(response => {
            resolve(response.data)
          })
          .catch(reject)
        return
      }

      // process simplified svg
      if (format === 'svg' && isSimplified) {
        let svg = icon.svgEffect || icon.svg
        if (icon.platform === 'office' && !icon.svgEffect) {
          axios
            .request({
              url: '/',
              baseURL: process.env.iconsUrl,
              method: 'get',
              params: {
                id: icon.iconId,
                size: iconSize,
                color,
                format: 'svg'
              },
              responseType: 'blob'
            })
            .then(response => {
              resolve(response.data)
            })
            .catch(reject)
          return
        }
        resolve(iconUtils.getSVGData(svg, { color, size: iconSize }))
        return
      }

      // process other vectors
      if (icon.vector && icon.vector[format]) {
        let url = '//image.icons8.com'
        if (format === 'svg') {
          url = `${process.env.apiUrl}/api/iconsets/download`
        }
        axios
          .request({
            url,
            method: 'get',
            params: {
              id: icon.iconId,
              format: format === 'svg' ? 'svg.editable' : format,
              size: iconSize,
              color
            },
            responseType: 'blob',
            withCredentials: true
          })
          .then(response => {
            resolve(response.data)
          })
          .catch(reject)
        return
      }

      // process other case, i.e. imported icon
      getIconContentBySVG({}, {
        svg: icon.svgEffect || icon.svg,
        format,
        size: iconSize,
        color
      })
        .then(response => {
          resolve(response.data)
        })
        .catch(reject)
    })
  }
}

function generateFont (icons, collection, token) {
  return new Promise(function (resolve, reject) {
    const data = {
      auth: {
        hash: token
      },
      task: {
        arguments: {
          collection: collection.id,
          font_name: collection.name
        }
      }
    }
    axios
      .request({
        url: '/api/task/create-web-font',
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => {
        const result = response.data.result
        if (result && result.task && result.task.results.zip) {
          const url = response.data.result.task.results.zip
          iconUtils.downloadUrl(url)
          resolve()
        } else {
          reject(result.task.status)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function generateIconSet (icons, name, token) {
  return new Promise(function (resolve, reject) {
    const data = {
      auth: {
        hash: token
      },
      task: {
        arguments: {
          icons: parseIcons(icons),
          svg_set_name: name,
          css_rules_case: 'lowercase'
        }
      }
    }
    axios
      .request({
        url: '/api/task/create-svg-set',
        baseURL: process.env.apiUrl,
        method: 'post',
        data,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .then(response => {
        const result = response.data.result
        if (result && result.task && result.task.results.zip) {
          const url = response.data.result.task.results.zip
          iconUtils.downloadUrl(url)
          resolve()
        } else {
          reject(result)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}

function parseIcons (rawIcons) {
  return rawIcons.map(icon => {
    return {
      name: iconUtils.normalizeValue(icon.name),
      svg: window.btoa(icon.svg)
    }
  })
}

export default download
