'use strict'

import recolor from './recolor'
import overlay from './overlay'
import text from './text'

import circle from './circle'
import stroke from './stroke'
import square from './square'
import background from './background'
import padding from './padding'

import size from './utils.size'
import shape from './utils.shape'

/**
 * Сервис на данный момент используется в effectsSliding
 * 1. Сначала вызываем initEditor который загружает Paper.js и задает начальные назначения полотна
 * 2. Далее вызываем initIcon который загружает иконку на полотно и применяет подключенные эффекты
 * 3. Далее можно применять новые эффекты вызовом selectEffect(effect.id)
 */
let helpers = {
  /**
   * отключаем все заменяемые эффекты, и вызывает updateAndExport()
   *
   */
  removeReplaceableEffects () {
    if (service.currentEffect.destroyHelpers) {
      service.currentEffect.destroyHelpers()
    }
    _iterateEffects(effect => {
      if (effect.type === 'replaceable') {
        effect.isActive = false
        effect.destroy()
      }
    })
    service.currentEffect = {}
    helpers.updateAndExport()
  },

  /**
   * Делает exportSvg() и зачем-то переберает эфекты
   *
   * @param {*} [{ ignoreCallback, skipIterate }={}]
   * @returns
   */
  saveEffects ({ ignoreCallback, skipIterate } = {}) {
    _iterateEffects(effect => {
      if (effect.destroyHelpers) {
        effect.destroyHelpers()
      }
    })

    _exportSvg()

    let enabledEffects = false
    _iterateEffects(effect => {
      if (effect.isActive) {
        enabledEffects = true
      }
      effect.enabled = effect.isActive

      if (!skipIterate) {
        effect.isActive = false
      }
    })
    return enabledEffects
  },

  /**
   * добавляем callback (fn) после рендера
   *
   * @param {function} fn
   */
  onRender (fn) {
    service.$.onRenderCallbacks.push(fn)
  },

  /**
   * удаляем callback после рендера
   *
   * @param {function} fn
   */
  offRender (fn) {
    let index = service.$.onRenderCallbacks.indexOf(fn)
    if (index >= 0) {
      service.$.onRenderCallbacks.splice(index, 1)
    }
  },

  /**
   * Оборачивает svg в div задает ширину и высоту для svg, и возвращае svg
   *
   * @param {svgNode} svg
   * @param {[width, height]} size
   * @returns svgNode
   */
  getSvgElement (svg, size) {
    let div = document.createElement('div')
    div.innerHTML = svg
    let svgDom = div.querySelector('svg')
    if (size) {
      svgDom.setAttribute('width', size[0])
      svgDom.setAttribute('height', size[1])
    }
    svgDom.setAttribute('overflow', 'visible')
    return svgDom
  },

  /**
   * return svg viewBox or canvas size or defaultValue
   *
   * @param {svgNode} svgElement
   * @param {[width, height]} defaultValue
   * @returns [width, height]
   */
  getViewBox (svgElement, defaultValue) {
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const arrayViewBoxSizes = viewBox.split(' ')
      if (arrayViewBoxSizes.length === 4) {
        return [parseInt(arrayViewBoxSizes[2]), parseInt(arrayViewBoxSizes[3])]
      }
    } else {
      return defaultValue || [service.$.width, service.$.height]
    }
  },

  /**
   * в elem есть path?
   *
   * @param {svgNode} element
   * @returns boolean
   */
  isPath (element) {
    return element instanceof service.paper.Path || element instanceof service.paper.CompoundPath
  },

  /**
   * это не path && есть дочерние элементы
   *
   * @param {Node} element
   * @returns boolean
   */
  isContainer (element) {
    return !helpers.isPath(element) && element.hasChildren()
  },

  /**
   * проходит по arguments и вызывает для каждого arguments.remowe()
   *
   * @param {*} arguments
   */
  removeElements () {
    for (let i = 0; i < arguments.length; i++) {
      const item = arguments[i]
      if (item && item.remove) {
        item.remove()
      }
    }
  },

  /**
   * Обновляет paper.js полотно и экспортирует svg с задержкой или без,
   * в зависимости от isImmediately
   *
   * @param {boolean} isImmediately
   */
  updateAndExport (isImmediately) {
    service.paper.view.update()
    if (isImmediately) {
      _exportSvg()
    } else {
      clearTimeout(service.exportTimeout)
      service.exportTimeout = setTimeout(() => {
        _exportSvg()
      }, 150)
    }
  },

  /**
   * Возвращает true при изменении позиции moveElements относительно холста
   *
   * @param {Event} event
   * @param {*} dragArea
   * @param {*} moveElements
   * @returns boolean
   */
  moveItemWithHold (event, dragArea, moveElements) {
    const x = event.delta.x
    const y = event.delta.y

    const dragAreaBounds = dragArea.bounds

    const topLeftAreaX = dragAreaBounds.topLeft.x + x
    const topRightAreaX = dragAreaBounds.topRight.x + x
    const topLeftAreaY = dragAreaBounds.topLeft.y + y
    const bottomLeftAreaY = dragAreaBounds.bottomLeft.y + y
    const holdSizeWidth = dragAreaBounds.width / 3
    const holdSizeHeight = dragAreaBounds.height / 3
    let isMove = false

    if (service.$.width > topLeftAreaX + holdSizeWidth && topRightAreaX - holdSizeWidth > 0) {
      isMove = true
      moveElements.forEach(function (item) {
        item.position.x += x
      })
    }

    if (service.$.height > topLeftAreaY + holdSizeHeight && bottomLeftAreaY - holdSizeHeight > 0) {
      isMove = true
      moveElements.forEach(function (item) {
        item.position.y += y
      })
    }

    return isMove
  }
}

let service = {
  paper: undefined, // Экземпляр paper.js
  resultSvg: undefined, // Результат работы paper.js
  currentEffect: {}, // Включеный (активный) эфект
  $: {
    backgroundRectangle: undefined, // Заливка холста  canvas
    width: undefined, // canvas.width
    height: undefined, // canvas.height
    lineWidthIos: 1, // canvas.width/50
    exportTimeout: undefined, // Счетчик задержки перед экспортом exportSvg()
    onRenderCallbacks: [], // Список callback функций
    svgIcon: {}, // Преобразованный SVG в paper.js
    icon: {
      viewBox: undefined, // [width, height] ширина и высота nativSVG
      width: undefined, // ширина nativSVG
      height: undefined, // высота nativSVG

      originalBounds: undefined, // Размер и расположение экземпляра paper.js
      color: undefined, // цвет заливки экземпляра paper.js
      isColor: undefined, // Иконка цветная? (platform.isColor)
      isImported: undefined, // Нет стиля иконки (!icon.platform)
      recolorData: undefined // новая цветовая схема из icon.colorsMap
    },

    // Methods
    updateAndExport: helpers.updateAndExport, // (isImmediately) => undefined | Обновляет paper.js полотно и делает экспорт exportSvg()
    getSvgElement: helpers.getSvgElement, // (svg, [width, height]) => svgNode | Оборачивает svg в div задает ширину и высоту для svg, и возвращае svg
    getViewBox: helpers.getViewBox, // (svg, [width, height]) => return svg viewBox or canvas size or defaultValue
    isPath: helpers.isPath, // (elem) => :Boolean | в elem есть path?
    isContainer: helpers.isContainer, // (elem) => :Boolean | это не path && есть дочерние элементы
    removeElements: helpers.removeElements, // (args) => :undefined | проходит по args и вызывает args.remove()
    moveItemWithHold: helpers.moveItemWithHold // (event, dragArea, moveElem) => :Boolean | is position changed
  },
  initEditor, // (canvas) => :Promise | загружает Paper.js и задает начальные назначения полотна
  initIcon, // (icon, platform, color, effect) => undefined | загружает иконку на полотно и включает эффекты
  selectEffect, // (id) => undefined | Включает эффект id и выкл. остальные
  disableEffect, // (id) => undefined | Выключает эффект id, и делает updateAndExport()
  saveEffects: helpers.saveEffects, // ({}) => boolian | Делает exportSvg() и зачем-то переберает эфекты
  removeReplaceableEffects: helpers.removeReplaceableEffects, // () => undefined | отключаем все заменяемые эффекты service.effects*replaceable
  onRender: helpers.onRender, // (fn) => undefined | Добавляем callback после рендера в $.onRenderCallbacks
  offRender: helpers.offRender, // (fn) => undefined | Удаляет  callback после рендера из $.onRenderCallbacks
  effects: { // Подключенные эфекты
    // single effects
    recolor,
    overlay,
    text,
    // replaceable effects
    stroke,
    padding,
    background,
    circle,
    square
  }
}

service.utils = {
  resizeIcon: size.resizeIcon.bind(service),
  restoreIconSize: size.restoreIconSize.bind(service),
  createShape: shape.createShape.bind(service)
}

/**
 * Инициализация экземпляра Paper.js в свойство service.paper
 *
 * @returns Promise
 */
const _initPaper = function () {
  return new Promise(function (resolve, reject) {
    if (service.paper) {
      resolve()
      return
    }

    /**
     * @param paper.setup
     * @param paper.Path
     * @param paper.Path.Rectangle
     * @param paper.Point
     * @param paper.project
     * @param paper.project.view.bounds
     * @param paper.project.importSVG
     * @param paper.project.exportSVG
     */
    import(/* webpackChunkName: "effects" */ 'paper').then(paper => {
      service.paper = paper.default
      resolve()
    }).catch(error => {
      console.error('Failed to load paper', error)
      reject()
    })
  })
}

/**
 * проходим по всем эффектам (service.effects) и выполняем для каждого функцию fn
 *
 * @param {function} fn
 */
const _iterateEffects = function (fn) {
  if (service.effects) {
    Object.keys(service.effects).forEach(key => {
      if (fn) {
        fn(service.effects[key])
      }
    })
  }
}

/**
 * Проходит рекурсивно по каждому дочернему эллементу item,
 * и добавляет strokeWidth (если strokeWidth > 1)
 *
 * @param {paper.project.importSVG(svgElement)} item
 * @param {boolean} isEditor
 */
const _setStrokeWidth = function (item, isEditor) {
  for (let i = 0; i < item.children.length; i++) {
    let obj = item.children[i]
    if (obj.style.strokeWidth > 1) {
      if (obj instanceof service.paper.Shape && obj.toPath) {
        const objPath = obj.toPath()
        obj.remove()
        obj = objPath
      }
      if (isEditor) {
        obj.style.strokeWidth *= service.$.width / service.$.icon.viewBox[0]
      } else {
        obj.style.strokeWidth /= service.$.width / service.$.icon.viewBox[0]
      }
    } else if (obj.children) {
      _setStrokeWidth(obj, isEditor)
    }
  }
}

/**
 * Вызывает _setStrokeWidth(item, true)
 *
 * @param {paper.project.importSVG(svgElement)} item
 */
const _setStrokeWidthEditor = function (item) {
  _setStrokeWidth(item, true)
}

/**
 * активируем все включенные эффекты, для текущего эффекта рисуем хелперы
 *
 */
const _activateEffects = function () {
  _iterateEffects(effect => {
    effect.isActive = false
    if (effect.enabled && service.currentEffect.id !== effect.id) {
      effect.activate({ showHelpers: false })
    }
  })
  if (service.currentEffect) {
    service.currentEffect.enabled = true
    service.currentEffect.isActive = true
    service.currentEffect.activate({ showHelpers: true })
  }
}

/**
 * Запускает все callback из onRenderCallbacks с аргументами (resultSvg, $.icon)
 *
 */
const _callOnRenderCallbacks = function () {
  service.$.onRenderCallbacks.forEach(fn => {
    fn(service.resultSvg, service.$.icon)
  })
}

/**
 * Экспорт итогового svg. Отключаем все хелперы и собираем обычный svg,
 * по окончании вызываем callback'и
 *
 * @param {*} [{ ignoreCallback }={}]
 */
function _exportSvg ({ ignoreCallback } = {}) {
  const svg = service.paper.project.exportSVG()

  svg.setAttribute('viewBox', `0 0 ${service.$.width} ${service.$.height}`)
  svg.removeAttribute('width')
  svg.removeAttribute('height')

  if (svg.outerHTML) {
    service.resultSvg = svg.outerHTML
  } else {
    // fix ie
    service.resultSvg = document.createElement('div').appendChild(svg).innerHTML
  }
  if (!ignoreCallback) {
    _callOnRenderCallbacks()
  }
}

/**
 * Загружает Paper.js и задает значения для полотна
 *
 * @param {nodeCanvas} canvas
 * @returns Promise
 */
function initEditor (canvas) {
  return new Promise(function (resolve, reject) {
    _initPaper(canvas)
      .then(() => {
        service.paper.setup(canvas)
        service.$.backgroundRectangle = new service.paper.Path.Rectangle(service.paper.project.view.bounds)
        service.$.width = canvas.width
        service.$.height = canvas.height
        service.$.lineWidthIos = canvas.width / 50
        resolve()
      })
      .catch(reject)
  })
}

/**
 * загружает иконку на полотно и включаем эффекты
 *
 * @param {{category, commonId, commonName, id, mainId, ...}} icon
 * @param {{apiCode, base64Encode, description, effects, ...}} platform
 * @param {String} color
 * @param {{$, activate, destroy, enabled, isActive, ...}} [effect={}]
 */
function initIcon (icon, platform, color, effect = {}) {
  let $icon = service.$.icon
  let $svgIcon = service.$.svgIcon
  if ($svgIcon.remove) {
    $svgIcon.remove()
  }

  let svgElement = helpers.getSvgElement(icon.svgCurrentResolution || icon.svg, [service.$.width, service.$.height])

  let viewBox = helpers.getViewBox(svgElement)
  $icon.viewBox = viewBox
  $icon.width = viewBox[0]
  $icon.height = viewBox[1]

  $svgIcon = service.$.svgIcon = service.paper.project.importSVG(svgElement)
  $icon.originalBounds = new service.paper.Rectangle(service.$.svgIcon.bounds)

  $icon.platform = icon.platform
  $icon.isColor = platform.isColor
  $icon.recolorData = {
    colorsMap: icon.colorsMap
  }
  $icon.color = `#${color}`

  $icon.isImported = !icon.platform
  if (!service.$.icon.isColor && !$icon.isImported && $icon.color) {
    $svgIcon.fillColor = $icon.color
  }
  if ($svgIcon.children) {
    _setStrokeWidthEditor($svgIcon)
  }

  service.currentEffect = effect
  // Каждый эфект инициализируем и скрываем с init() и destroy()
  _iterateEffects(effect => {
    if (effect.init) {
      effect.init(service)
    }
    if (effect.destroy && effect !== service.currentEffect) {
      effect.destroy()
    }
  })

  _activateEffects()
}

/**
 * Включает эффект id и выключает остольные
 *
 * @param {String} id
 */
function selectEffect (id) {
  // если переданный эффект уже активирован, то ничего не делаем
  if (service.currentEffect.id === id) {
    return
  }
  // иначе отключаем все хелперы текущего эффекта
  if (service.currentEffect.destroyHelpers) {
    service.currentEffect.destroyHelpers()
  }
  service.currentEffect.enabled = false

  const newEffect = service.effects[('' + id).toLowerCase()]

  // если новый эффект в списке заменяемых, то отключаем все заменяемые эффекты
  const isReplaceable = newEffect.type === 'replaceable'
  if (isReplaceable) {
    _iterateEffects(effect => {
      if (effect.type === 'replaceable') {
        effect.isActive = false
        effect.destroy()
      }
    })
  }
  newEffect.isActive = true
  newEffect.enabled = true
  service.currentEffect = newEffect
  service.currentEffect.activate({ showHelpers: true })
}

/**
 * Выключает эффект id, и вызывает updateAndExport()
 *
 * @param {String} id
 */
function disableEffect (id) {
  const effect = service.effects[('' + id).toLowerCase()]
  effect.destroy()
  effect.isActive = false
  if (service.currentEffect.id === id) {
    service.currentEffect = {}
  }
  helpers.updateAndExport()
}

export default service
