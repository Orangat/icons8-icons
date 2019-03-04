'use strict'

const defaults = {
  radius: 10,
  color: '#c44'
}

const effect = {
  id: 'Stroke',
  name: 'WEB_APP.EFFECT.STROKE.TITLE',
  type: 'replaceable',
  event: 'Set stroke', // event name for analytics
  isActive: false, // is effect applied for editor
  enabled: false, // if effect applied for icon
  icon: 'stroke',
  tooltip: 'WEB_APP.EFFECT.STROKE.ADD',
  params: defaults,
  init,
  activate,
  destroy,
  $: {
    initialized: false,
    container: undefined
  }
}

let service

function init (effectsService) {
  service = effectsService
  effect.$.initialized = true
}
function activate (options = {}) {
  let overlay = service.effects.overlay
  /** если уже был активен эффект overlay вместе с stroke, то сначала следы stroke из overlay */
  if (overlay && overlay.isActive && overlay.copyStroke) {
    overlay.copyStroke.remove()
  }

  effect.params = Object.assign(defaults, { color: service.$.icon.color }, options)
  if (options.color) {
    service.$.icon.color = options.color
  }

  effect.$.container = effect.$.container || new StrokeObj([service.$.svgIcon])
  effect.$.container.applyStroke(effect.params.color, effect.params.radius)

  /** если активен эффект overlay, то добавляем в stroke контейнер иконку оверлея */
  if (overlay && overlay.isActive && overlay.$.overlaySvg) {
    effect.$.container.addObject(overlay.$.overlaySvg)
    overlay.replaceIcon()
  }

  /** если так же активен текстовый эффект, то добавляем его в контейнер с эффектом stroke */
  let text = service.effects.text
  if (text && text.isActive && text.$.textItem instanceof service.paper.Item) {
    effect.$.container.addObject(text.$.textItem)
  }
  service.$.updateAndExport()
}

function destroy () {
  if (!effect.$.initialized) {
    return
  }
  const overlay = service.effects.overlay
  if (overlay && overlay.isActive && overlay.$.copyStroke && overlay.$.copyStroke.remove) {
    overlay.$.copyStroke.remove()
  }
  if (effect.$.container) {
    effect.$.container.removeClones()

    /** если так же активен текстовый эффект, то удаляем его из контейнера с эффектом stroke */
    let text = service.effects.text
    if (text && text.isActive && text.$.textItem instanceof service.paper.Item) {
      effect.$.container.removeObject(text.$.textItem)
    }

    service.paper.project.view.zoom = 1
    service.$.updateAndExport()
    effect.$.container = null
  }
}

// Stroke Cont
function StrokeObj (objs) {
  const originals = objs || []
  const strokeOptions = {
    visible: true,
    strokeColor: '#ffaaaa',
    strokeWidth: 10,
    strokeJoin: 'round'
  }
  let clones = []

  const uniteSegments = function (container) {
    const shape = new service.paper.Path()

    if (service.$.isPath(container)) {
      container.replaceWith(container.unite(shape))
      container.remove()
      return
    }

    container.children.forEach(function (element) {
      if (service.$.isContainer(element)) {
        uniteSegments(element)
      } else if (element.toPath) {
        const a = element.toPath()
        element.remove()
        a.replaceWith(a.unite(shape))
        a.remove()
      } else if (service.$.isPath(element)) {
        element.replaceWith(element.unite(shape))
        element.remove()
      }
    })
  }

  const makeClone = function (obj) {
    const clone = obj.clone()
    uniteSegments(clone)
    service.paper.project.activeLayer.insertChild(0, clone)
    return clone
  }

  const applyStroke = function (obj) {
    Object.getOwnPropertyNames(strokeOptions).forEach(function (name) {
      obj[name] = strokeOptions[name]
    })
  }

  this.getOriginals = function () {
    return originals
  }

  this.getClones = function () {
    return clones
  }

  this.getCloneByOriginal = function (original) {
    const index = originals.indexOf(original)
    if (~index) {
      return clones[index]
    }
    return false
  }

  this.addObject = function (object) {
    if (!~originals.indexOf(object)) {
      originals.push(object)
      const clone = makeClone(object)
      applyStroke(clone)
      clones.push(clone)
    }
    return this
  }

  this.removeObject = function (object) {
    const index = originals.indexOf(object)
    if (~index) {
      originals.splice(index, 1)
      if (clones[index]) {
        clones[index].remove()
        clones.splice(index, 1)
      }
    }
    return this
  }

  this.updateClones = function () {
    this.removeClones()
    clones = originals.map(function (one) {
      return makeClone(one)
    })
  }

  this.removeClones = function () {
    clones.forEach(function (one) {
      one.remove()
    })
    clones.length = 0
    return this
  }

  this.resizeLayer = function (strokeWidth) {
    const strokeRatio = strokeWidth / service.paper.project.view.size._width
    service.paper.project.view.zoom = 1 - strokeRatio.toFixed(3)
    return this
  }

  this.applyStroke = function (strokeColor, strokeWidth) {
    strokeOptions.strokeColor = strokeColor
    strokeOptions.strokeWidth = +strokeWidth
    clones.forEach(function (one) {
      applyStroke(one)
    })
    this.resizeLayer(strokeWidth)
    return this
  }

  this.init = function () {
    if (clones.length !== originals.length) {
      this.updateClones()
    }
    return this
  }
  this.init()
}

export default effect
