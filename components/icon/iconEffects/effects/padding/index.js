'use strict'

/**
 * Zoom whole icon layout with all effects
 */

const defaults = {
  padding: 30
}

const effect = {
  id: 'Padding',
  name: 'WEB_APP.EFFECT.PADDING.TITLE',
  type: 'replaceable',
  event: 'Set padding', // event name for analytics
  isActive: false, // is effect applied for editor
  enabled: false, // if effect applied for icon
  icon: 'padding',
  tooltip: 'WEB_APP.EFFECT.PADDING.ADD',
  params: defaults,
  init,
  activate,
  destroy,
  destroyHelpers,
  activeHelpers,
  hideHelpers,
  showHelpers,
  $: {
    initialized: false,
    zoom: 1,
    colorBorder: '#f713f3',
    sizeBorderLineT: {},
    sizeBorderLineB: {},
    sizeBorderLineL: {},
    sizeBorderLineR: {}
  }
}

let service

function init (effectsService) {
  service = effectsService
  effect.$.initialized = true
}

function activate (options = {}) {
  effect.params = Object.assign(defaults, options)

  effect.params.padding = isNaN(parseInt(effect.params.padding)) ? 30 : parseInt(effect.params.padding)

  effect.$.zoom = getPaddingSize(effect.params.padding)

  service.paper.project.view.zoom = effect.$.zoom
  destroyHelpers()
  if (options.showHelpers) {
    activeHelpers()
  }

  service.$.updateAndExport()
}

function destroy () {
  if (!effect.$.initialized) {
    return
  }
  destroyBorder()
  service.paper.project.view.zoom = 1
}

function getPaddingSize (value) {
  value = value || effect.params.padding
  return (100 - parseInt(value, 10)) / 100
}

function activateBorder () {
  const size = effect.$.zoom
  const paper = service.paper

  const colorBorder = effect.$.colorBorder
  const canvasWidth = service.$.width
  const canvasHeight = service.$.height
  if (size < 1) {
    const padding = Math.abs((canvasWidth / size - canvasWidth) / 2)
    effect.$.sizeBorderLineT = new paper.Path.Line({
      from: [-padding, 0],
      to: [canvasWidth + padding, 0],
      strokeColor: colorBorder
    })
    effect.$.sizeBorderLineB = new paper.Path.Line({
      from: [-padding, canvasHeight],
      to: [canvasWidth + padding, canvasHeight],
      strokeColor: colorBorder
    })
    effect.$.sizeBorderLineL = new paper.Path.Line({
      from: [0, -padding],
      to: [0, canvasHeight + padding],
      strokeColor: colorBorder
    })
    effect.$.sizeBorderLineR = new paper.Path.Line({
      from: [canvasWidth, -padding],
      to: [canvasWidth, canvasHeight + padding],
      strokeColor: colorBorder
    })
  }
}

function destroyBorder () {
  service.$.removeElements(
    effect.$.sizeBorderLineT,
    effect.$.sizeBorderLineB,
    effect.$.sizeBorderLineL,
    effect.$.sizeBorderLineR
  )
}

function destroyHelpers () {
  destroyBorder()
}

function activeHelpers () {
  activateBorder()
}

function hideHelpers () {
  effect.$.sizeBorderLineT.opacity = 0
  effect.$.sizeBorderLineB.opacity = 0
  effect.$.sizeBorderLineL.opacity = 0
  effect.$.sizeBorderLineR.opacity = 0
}

function showHelpers () {
  effect.$.sizeBorderLineT.opacity = 1
  effect.$.sizeBorderLineB.opacity = 1
  effect.$.sizeBorderLineL.opacity = 1
  effect.$.sizeBorderLineR.opacity = 1
}

export default effect
