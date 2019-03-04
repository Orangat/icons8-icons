'use strict'

const defaults = {
  color: '#ddd'
}

const effect = {
  id: 'Background',
  name: 'WEB_APP.EFFECT.BACKGROUND.TITLE',
  type: 'replaceable',
  event: 'Set background', // event name for analytics
  isActive: false, // is effect applied for editor
  enabled: false, // if effect applied for icon
  icon: 'background',
  tooltip: 'WEB_APP.EFFECT.BACKGROUND.ADD',
  params: defaults,
  init,
  activate,
  destroy,
  $: {
    initialized: false
  }
}

let service

function init (effectsService) {
  service = effectsService
  effect.$.initialized = true
}

function activate (options = {}) {
  effect.params = Object.assign(defaults, options)

  service.$.backgroundRectangle.fillColor = effect.params.color
  service.$.updateAndExport()
}

function destroy () {
  if (!effect.$.initialized) {
    return
  }
  service.$.backgroundRectangle.fillColor = null
}

export default effect
