'use strict'

/**
 * Add text above icon
 */

const defaults = {
  text: 'T',
  font: 'Roboto',
  isBold: false,
  isItalic: false,
  size: 48,
  color: '#000'
}

const effect = {
  id: 'Text',
  name: 'WEB_APP.EFFECT.TEXT.TITLE',
  type: 'single',
  event: 'Set text', // event name for analytics
  isActive: false, // is effect applied for editor
  enabled: false, // if effect applied for icon
  icon: 'text',
  tooltip: 'WEB_APP.EFFECT.TEXT.ADD',
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
    textItem: {},
    border: {},
    dragArea: {},
    padding: 10,
    position: {},
    icons: {
      bold: 'B',
      italic: 'I'
    },
    fonts: {}
  }
}

let service

function init (effectsService) {
  service = effectsService
  effect.$.position = {
    x: service.$.width / 2,
    y: service.$.height / 2
  }
  effect.$.initialized = true
}

function activate (options = {}) {
  const paper = service.paper

  effect.params = Object.assign(defaults, { color: service.$.icon.color }, options)

  const params = effect.params
  const $ = effect.$

  let stroke = service.effects.stroke
  if (stroke && stroke.isActive && $.textItem) {
    stroke.$.container.removeObject($.textItem)
  }

  if (params.isBold) {
    params.font += 'Bold'
  }
  if (params.isItalic) {
    params.font += 'Italic'
  }
  const font = `${params.font}.ttf`

  params.text = params.text || 'Text'

  textToSvg(params.text, font, params.size)
    .then(function (result) {
      // if textItem exist, update position
      if ($.textItem.position) {
        $.position = $.position || {}
        $.position.x = $.textItem.position.x
        $.position.y = $.textItem.position.y
      }

      // if textItem exist - remove textItem
      service.$.removeElements($.textItem)
      destroyHelpers()

      $.textItem = paper.project.importSVG(service.$.getSvgElement(result))
      $.textItem.position = new paper.Point($.position.x, $.position.y)

      $.textItem.fillColor = params.color

      if (options.showHelpers) {
        activeHelpers()
      }

      if (stroke.$.container && stroke.isActive) {
        stroke.$.container.addObject($.textItem)
      }

      service.$.updateAndExport()
    })
}

function destroy () {
  if (!effect.$.initialized) {
    return
  }
  const $ = effect.$
  let stroke = service.effects.stroke
  if (stroke && stroke.isActive && $.textItem) {
    stroke.$.container.removeObject($.textItem)
  }
  service.$.removeElements($.textItem)
  destroyHelpers()
}

function destroyHelpers () {
  service.$.removeElements(effect.$.border, effect.$.dragArea)
}

function activeHelpers () {
  activateBorder()
  activateDragArea()
}

function hideHelpers () {
  effect.$.border.opacity = 0
}

function showHelpers () {
  effect.$.border.opacity = 1
}

function textToSvg (text, fontName, size) {
  // TODO new path to fonts
  const pathToFonts = 'https://icons8.com/build/public/fonts/editor/'
  const svgElementBegin = '<svg xmlns="http://www.w3.org/2000/svg">'
  const svgElementEnd = '</svg>'

  return new Promise(function (resolve, reject) {
    const localFont = effect.$.fonts[fontName]

    if (localFont) {
      resolve(toSvg(localFont))
    } else {
      import(/* webpackChunkName: "effects" */ 'opentype.js/dist/opentype.min.js').then(opentype => {
        opentype.load(pathToFonts + fontName, function (err, font) {
          if (!err) {
            effect.$.fonts[fontName] = font
            resolve(toSvg(font))
          } else {
            reject('Error load font')
          }
        })
      })
    }
  })

  function toSvg (opentypeFont) {
    size = parseInt(size, 10)
    const path = opentypeFont.getPath(text, 0, size, size)
    return svgElementBegin + path.toSVG() + svgElementEnd
  }
}

function activateBorder () {
  const paper = service.paper
  const $ = effect.$
  const padding = $.padding

  $.border = new paper.Path()
  $.border.strokeColor = '#5dd3c8'

  $.border.add(new paper.Point($.textItem.bounds.topLeft.x - padding, $.textItem.bounds.topLeft.y - padding))
  $.border.add(new paper.Point($.textItem.bounds.topRight.x + padding, $.textItem.bounds.topRight.y - padding))
  $.border.add(new paper.Point($.textItem.bounds.bottomRight.x + padding, $.textItem.bounds.bottomRight.y + padding))
  $.border.add(new paper.Point($.textItem.bounds.bottomLeft.x - padding, $.textItem.bounds.bottomLeft.y + padding))
  $.border.closed = true
}

// pseudo area around textItem for d'n'd
function activateDragArea () {
  const paper = service.paper
  const $ = effect.$
  const padding = $.padding

  $.dragArea = new paper.Path.Rectangle({
    point: new paper.Point(
      $.textItem.bounds.topLeft.x - padding,
      $.textItem.bounds.topLeft.y - padding
    ),
    size: [
      $.textItem.bounds.width + 2 * padding,
      $.textItem.bounds.height + 2 * padding
    ]
  })
  $.dragArea.fillColor = 'red'
  $.dragArea.strokeColor = '#50e3c2'
  $.dragArea.strokeWidth = 3
  $.dragArea.opacity = 0

  $.dragArea.onMouseDrag = function (event) {
    moveItem(event)
  }

  $.dragArea.onMouseEnter = function () {
    // element.addClass('m-move')
  }

  $.dragArea.onMouseDown = function () {
    // body.addClass('m-noselect')
    // textEnableWatch = false
    // $scope.effectsEnabled.text = true
    // $.border.opacity = 0;
  }

  $.dragArea.onMouseLeave = function () {
    // element.removeClass('m-move')
  }

  $.dragArea.onMouseUp = function () {
    // body.removeClass('m-noselect')
    // textEnableWatch = true
    // $scope.position.x = $.textItem.position.x
    // $scope.position.y = $.textItem.position.y
    service.$.updateAndExport(true)
    // $scope.$apply()
  }

  function moveItem (event) {
    service.$.moveItemWithHold(event, $.dragArea, [$.textItem, $.dragArea, $.border], 50)

    let stroke = service.effects.stroke
    if (stroke.$.container && stroke.isActive) {
      const clone = stroke.$.container.getCloneByOriginal($.textItem)
      clone.position.x = $.textItem.position.x
      clone.position.y = $.textItem.position.y
    }
  }
}

export default effect
