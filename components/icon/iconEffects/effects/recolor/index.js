'use strict'

/**
 * Recolor multicolor icons
 */

const icon = '<img style="width: 100%" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACtVBMVEVHcEwe6kr6Nhwxde7pDYj6SxjGJcVDu7U2j/L1f3X8ww4teuolYd8qXN07m/ebMMx+OM8H7DP+qQn3BjSQ7A7sDIH+pwrfEqoyeuknbuYzifEueOcvfepAlfQ5l/gkWt89mvv/qgsR8B9DTtcL7jc0U9haRNVVRtVGTNZoQNIa7x2lKcisKMj/YCCBN87AH8XIHMWYL8so7xr7hQ//zQXcFcD/2AT8WBj7fBIU3mb7PR1ApPsR4Fv55gD4JiHiErz7aRb4HyDs6QM68Boa1XlBqv9K7hdW8Rn5CSYg0YsmyZ/b6gUxvsg7s+U4tt4wwMAryals7hNl7hVArPyi6w286gnyCEnwCWCA7BDtDn626wjU6QcG7yM5suQueulcQ9Q/TdjQGMAjXt4tVdoqdOgnZ+ElY+CDNM4yiPAvgOw3lPQ/p/wb8Bxl7RNB7xek6wtRSNb9qQknbOQ5l/clWdw+ovo8n/dyO9BqPtEp8Bk3ttz4CiSyI8f3BSqkKMjmD6f6QBrvCmb73QEwhO9URtU1jPA1UdgqcOZAq/z5KB8H6jTzB0f25wCNMMw17xicK8kc0oHoDpK7IMbW6QXrDH06mvh7OM/CHsR77BAuwLzfEr2a6wwoxqqULsrh6AMlyp4izZcT3GQZ13ZS7hX8gA/7bBT6Yhb8jA/6VRf2HiEM5Eq96gf9vwcswrVa7hQW2W0O4VLxB1Ef0Ity7RE2t9jJ6gfjELP5Mh3tC3P+0gP+xwXWFr0R31owvcWrJsjnD537dhKX6w32BjD4DyOp6QsweOYS8B3D6gcI6D/8kg7wCFr9swjs5wH6mgyQ6w2D7A/ZFcBJ7hb9oQvm5wPJGsML5UE0udJLocDyBzi26giA7A/9zgXu4QKW0hV5OLzxuAnNIVC0xw/VNTfJGrBkRsTlDTsd5DJpbTN1AAAAXHRSTlMAGPwY/f0YBv4GGMfzlpY6luPj8/OW8fougoLj4xjxR0ctx9kuv9nz87+CgscY8ePj9PTHx8eCloKCR7/H9JWC9L+WlvTZ8UfZlvHxv/PZlUe/lfPZldm/2Ue/RyQHRS8AAAMJSURBVDjLbZP1V5phFMdfz3Rgzjyuu7u7u7vHwJd4QQYKiCibiSIGooQYUwwEBWOiE7s2u3Zs172/Y88D9vY9z2/fz73fe85zL4JMCbfCed2ajRvWb3JdgEP+1TxnJz4lxscnmhQcrN7uOn+OjVvkhJHJFIoFCFLTs3ZtsZ9V7sij0aYBOj0rKWzrjCYLl1AlPBpG5k8CiUlhISE7FkzVLyVSqTwehvH5MdOAInXnRA+co68vsU0iASEWIEidmBXWqEhF0X3WORYzAECkQoA8CTSGpKaidRknoL8ML2YwLD14GJkSE01S02EAimZkmL1hiAsez2BERRGJEgmGUWI4FkAB683h4V5gguVMJhMvFgOEyqPxKRwSPbExZBgFdpNcbmuPrEwJCIAEA/bgWQEQUGc2NzXZ2qoeIS6BAkEKgEAQ6IGROaSssGHUHC6Xq1TV1ZFeyJHAQIiALmKGL5GGcUhJjWhdOKyujozsfoCci30GBKmUALyYKOEEK9AmOTC7u00mU8J95E4skAURCJhM37ZfX35626pArSkBygO59nSWxr79Hh9/AxQaCl5oqAdy/blVr4FGRxvGfhgMhrdAL6y6iFxtaGhITy8pyczMzknOG/nz+Xtfgb4wIqKqKi4uzmA4hdxIn7Czy5Nz6wms/tav3GZdod0Echy5CaycnPLkvFf1ZfEE2UB/6ycRty+/Wa+HUMRhBHcZ2NDPNY4Q2v20/a29oh5uQb5OV1hoZ2cHPvxSMnTrjZ0EAkuoZbe0KodqarmDBfnNOr3+APhNm7PQL+uMJxCEslJ2i79SI6rp4XZB4uQ2uBCHcsssNoslG2BXtPhXKqWi2mLuIEAOWlfuqNEYDwGh3yQg/Vjbw+3r2jOx+jZuwG5nCWUD2oq0l/4dlUO9opriYq67w+Rar3WzBMi0pRAoqtT0ikCI+6rpw7BZ3S4U+vmVstM+AKBDo5FKa/Y6zDq9zbvBBAB4BwGlRnpsv/2c67Q5c17LtgDvi5RXTjv8575xF27feujpeffxvSczqv8CTiOd/JlzVnIAAAAASUVORK5CYII="/>'

const effect = {
  id: 'Recolor',
  name: 'WEB_APP.EFFECT.RECOLOR.TITLE',
  type: 'single',
  event: 'Set colors', // event name for analytics
  isActive: false, // is effect applied for editor
  enabled: false, // if effect applied for icon
  icon,
  tooltip: 'WEB_APP.EFFECT.RECOLOR.ADD',
  params: {
    colorsMap: {}
  },
  init,
  activate,
  destroy,
  $: {
    initialized: false
  }
}

let service

const _replaceIcon = function () {
  if (service.effects.overlay.isActive) {
    service.effects.overlay.replaceIcon()
  }
}

function init (effectsService) {
  service = effectsService
  effect.service = service
  effect.$.initialized = true

  const colorsInfo = getColorsInfo(service.$.svgIcon)
  const recolorData = service.$.icon.recolorData
  recolorData.colorsMap = Object.assign({}, recolorData.colorsMap || colorsInfo.colorsMap)
  recolorData.fillColors = colorsInfo.fillColors
  recolorData.strokeColors = colorsInfo.strokeColors

  effect.params = Object.assign(effect.params, service.$.icon.recolorData)
}

function activate () {
  applyColors(true, _replaceIcon)
}

function destroy () {
  applyColors(false, _replaceIcon)
}

function getColorsInfo (el) {
  const colorsMap = {}
  const fillColors = {}
  const strokeColors = {}

  extractColors(el, colorsMap, fillColors, strokeColors)

  return {
    colorsMap,
    fillColors,
    strokeColors
  }
}

function extractColors (el, colorsMap, fillColors, strokeColors) {
  if (el.style.fillColor) {
    const hex = el.style.fillColor.toCSS(true)
    fillColors[hex] = fillColors[hex] || []
    fillColors[hex].push(el)
    colorsMap[hex] = colorsMap[hex] || {
      initColor: hex,
      currentColor: hex
    }
  }
  if (el.style.strokeColor) {
    const hex = el.style.strokeColor.toCSS(true)
    strokeColors[hex] = strokeColors[hex] || []
    strokeColors[hex].push(el)
    colorsMap[hex] = colorsMap[hex] || {
      initColor: hex,
      currentColor: hex
    }
  }
  if (el.children) {
    el.children.forEach(children => {
      extractColors(children, colorsMap, fillColors, strokeColors)
    })
  }
}

function applyColors (isColor = true, callback = () => {}) {
  if (service) {
    const recolorData = service.$.icon.recolorData
    let colorsMap = recolorData.colorsMap
    let fillColors = recolorData.fillColors
    let strokeColors = recolorData.strokeColors
    if (colorsMap) {
      Object.keys(colorsMap).forEach(hex => {
        const currentColor = isColor ? colorsMap[hex].currentColor : colorsMap[hex].initColor
        if (fillColors[hex]) {
          fillColors[hex].forEach(el => {
            el.fillColor = currentColor
          })
        }
        if (strokeColors[hex]) {
          strokeColors[hex].forEach(el => {
            el.strokeColor = currentColor
          })
        }
      })
    }
    callback()
    service.$.updateAndExport()
  }
}

export default effect
