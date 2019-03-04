'use strict'

// convert to string, lowerCase, replace all spaces and '_' to '-'
// usage example: url params
function normalizeValue (value) {
  return ('' + value).trim().toLowerCase()
    .split(' ').join('-')
    .split('_').join('-')
    .split('%20').join('-')
    .split('/').join('-')
    .split('\\').join('-')
}

const isSafari = !process.browser ? false : navigator.userAgent.indexOf('Safari') !== -1 &&
  navigator.userAgent.indexOf('Chrome') === -1

function saveAsExt (data, fileName) {
  return new Promise(function (resolve) {
    const fr = new FileReader()
    let textArea
    fr.onloadend = function () {
      const form = document.createElement('form')
      form.setAttribute('method', 'post')
      form.setAttribute('action', `${process.env.apiUrl}/api/lightbox/download`)
      form.setAttribute('target', '_top')
      form.setAttribute('style', 'display: none;')
      document.body.appendChild(form)

      const input = document.createElement('input')
      input.setAttribute('name', 'name')
      input.setAttribute('value', fileName)
      input.setAttribute('type', 'text')
      form.appendChild(input)

      textArea = document.createElement('textarea')
      textArea.setAttribute('name', 'data')
      textArea.setAttribute('type', 'text')
      textArea.setAttribute('maxlength', 100000000)
      textArea.value = fr.result.replace(/^[^,]+,/, '')
      form.appendChild(textArea)

      form.submit()
      form.remove()
      resolve()
    }
    fr.readAsDataURL(data)
  })
}

function downloadUrl (url, filename) {
  if (isSafari) {
    let iframe = document.createElement('iframe')
    iframe.setAttribute('width', '1')
    iframe.setAttribute('height', '1')
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('src', url)

    document.body.appendChild(iframe)
    return true
  } else {
    let a = document.createElement('a')
    a.href = url
    a.setAttribute('target', '_blank')
    if (a.download !== undefined) {
      // Set HTML5 download attribute. This will prevent file from opening if supported.
      a.download = filename
    }
    // a.style.display = 'none'

    document.body.appendChild(a)

    if (document.createEvent) {
      let e = document.createEvent('MouseEvents')
      e.initEvent('click', true, true)
      a.dispatchEvent(e)
      return true
    } else {
      a.click()
    }

    return true
  }
}

function getSVGNode (svg) {
  if (svg) {
    svg = svg.substr(svg.indexOf('<svg'))
  } else {
    return
  }
  const container = document.createElement('div')
  container.insertAdjacentHTML('afterbegin', svg)
  return container.childNodes[0]
}

function getSVGData (svg, options) {
  const $svg = getSVGNode(svg)
  if (!$svg) {
    return
  }
  $svg.setAttribute('width', options.size)
  $svg.setAttribute('height', options.size)
  $svg.style.fill = `#${options.color}`

  return (new XMLSerializer()).serializeToString($svg)
}

function getIconUrl (icon) {
  if (icon) {
    let name = encodeURIComponent(normalizeValue(icon.name))
    return `/icon/${icon.id}/${name}`
  } else {
    return `/icon`
  }
}

function getPackUrl (category) {
  let pack = encodeURIComponent(normalizeValue(category))
  return `/icon/pack/${pack}`
}

const locales = {
  'zh-CN': {
    name: '繁體中文',
    url: 'https://icons8.cn',
    icon: require('../assets/icons/locale/zh-CN.png'),
    countries: ['CN', 'TW'],
    locale: 'zh-CN',
    code: 'zh',
    apiUrl: 'https://api.icons8.cn'
  },
  'en-US': {
    name: 'English',
    url: 'https://icons8.com',
    icon: require('../assets/icons/locale/en-US.png'),
    countries: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'],
    locale: 'en-US',
    code: 'en',
    apiUrl: 'https://api.icons8.com'
  },
  'fr-FR': {
    name: 'Français',
    url: 'https://icones8.fr',
    icon: require('../assets/icons/locale/fr-FR.png'),
    countries: ['FR', 'BE', 'LU', 'BJ', 'MA', 'MD', 'TN', 'CM'],
    locale: 'fr-FR',
    code: 'fr',
    apiUrl: 'https://api.icones8.fr'
  },
  'de-DE': {
    name: 'Deutsch',
    url: 'https://icons8.de',
    icon: require('../assets/icons/locale/de-DE.png'),
    countries: ['DE', 'AT', 'CH', 'LI'],
    locale: 'de-DE',
    code: 'de',
    apiUrl: 'https://api.icons8.de'
  },
  'it-IT': {
    name: 'Italiano',
    url: 'https://it.icons8.com',
    icon: require('../assets/icons/locale/it-IT.png'),
    countries: ['IT', 'SM'],
    locale: 'it-IT',
    code: 'it',
    apiUrl: 'https://api.icons8.it'
  },
  'ja-JP': {
    name: '日本語',
    url: 'https://icons8.jp',
    icon: require('../assets/icons/locale/ja-JP.png'),
    countries: ['JP'],
    locale: 'ja-JP',
    code: 'ja',
    apiUrl: 'https://api.icons8.jp'
  },
  'pt-BR': {
    name: 'Português',
    url: 'https://icons8.com.br',
    icon: require('../assets/icons/locale/pt-BR.png'),
    countries: ['PT', 'BR'],
    locale: 'pt-BR',
    code: 'pt',
    apiUrl: 'https://api.icons8.com.br'
  },
  'ru-RU': {
    name: 'Русский',
    url: 'https://icons8.ru',
    icon: require('../assets/icons/locale/ru-RU.png'),
    countries: ['UA', 'RU', 'BY', 'KZ'],
    locale: 'ru-RU',
    code: 'ru',
    apiUrl: 'https://api.icons8.ru'
  },
  'es-ES': {
    name: 'Español',
    url: 'https://iconos8.es',
    icon: require('../assets/icons/locale/es-ES.png'),
    countries: ['AR', 'ES', 'MX', 'CO', 'CL', 'BO'],
    locale: 'es-ES',
    code: 'es',
    apiUrl: 'https://api.iconos8.es'
  }
}

function detectLanguage (req) {
  // req is undefined when we use nuxt generate
  if (!req) {
    return locales['en-US']
  }
  if (req.url.indexOf('crowdin-overlay') >= 0) {
    return {
      ...locales['en-US'],
      locale: 'zu-ZA'
    }
  }
  const hostname = req.hostname || req.headers.host
  const origin = `https://${hostname}`
  const languages = locales
  let locale
  if (!(
    process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'dev' ||
    process.env.NODE_ENV === 'pre'
  )) {
    const isRu = hostname.indexOf('.ru')
    const isIt = hostname.indexOf('.it')
    const isDe = hostname.indexOf('.de')
    if (isRu > 0) {
      locale = 'ru-RU'
    }
    if (isIt > 0) {
      locale = 'it-IT'
    }
    if (isDe > 0) {
      locale = 'de-DE'
    }
  }
  const languageList = Object.values(languages)
  let lang = languageList.find(language => language.url === origin)
  if (!lang) {
    locale = locale || process.env.language
    lang = languageList.find(language => language.locale === locale)
  }
  if (!lang) {
    lang = languages['en-US']
  }
  return lang
}

function UniqueNames () {
  this.names = {}

  this.getName = function (name) {
    let newName = name
    const counter = this.names[name] || 1
    if (counter > 1) {
      newName = `${name}-${counter}`
    }
    this.names[name] = counter + 1
    return newName
  }
}

export default {
  normalizeValue,
  saveAsExt,
  downloadUrl,
  getSVGNode,
  getSVGData,
  getIconUrl,
  getPackUrl,
  locales,
  detectLanguage,
  UniqueNames
}
