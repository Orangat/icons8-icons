'use strict'

function forEachEffects (type, callback) {
  Object.keys(type).forEach(id => {
    if (callback) {
      callback(type[id])
    }
  })
}

export default function analyticsTrack () {
  const iconId = this.icon._id ? this.icon._id : 'imported'
  const effectsTracks = []
  const category = 'Effects'

  Object.keys(this.effects).forEach(key => {
    let effect = this.effects[key]
    effectsTracks.push({
      event: effect.event,
      category: this.category,
      properties: effect.params
    })
  })

  if ($scope.effectsEnabled.text) {
    effectsTracks.push({
      event: 'Set text',
      category: category,
      properties: {
        text: $scope.iconText,
        font: $scope.font.name,
        bold: $scope.bold,
        italic: $scope.italic,
        color: $scope.textColor
      }
    })
  }
  if ($scope.effectsEnabled.overlay) {
    effectsTracks.push({
      event: 'Set overlay',
      category: category,
      properties: {
        name: $scope.overlay.id,
        platform: $scope.icon.platform ? $scope.icon.platform.apiCode : 'imported',
        color: $scope.overlay.color
      }
    })
  }
  if ($scope.effectsEnabled.circle) {
    effectsTracks.push({
      event: 'Set circle',
      category: category,
      properties: {
        fill: $scope.circle.fill,
        color: $scope.circle.color,
        strokeWidth: $scope.circle.fill ? '' : $scope.circle.borderWidth,
        radius: $scope.circle.radius,
        iconSize: $scope.circle.iconSize
      }
    })
  }
  if ($scope.effectsEnabled.square) {
    effectsTracks.push({
      event: 'Set square',
      category: category,
      properties: {
        fill: $scope.square.fill,
        color: $scope.square.color,
        strokeWidth: $scope.square.fill ? '' : $scope.square.borderWidth,
        cornerRadius: $scope.square.borderRadius,
        size: $scope.square.radius,
        iconSize: $scope.square.iconSize
      }
    })
  }
  if ($scope.effectsEnabled.stroke) {
    effectsTracks.push({
      event: 'Set stroke',
      category: category,
      properties: {
        size: $scope.stroke.radius,
        color: $scope.stroke.color
      }
    })
  }
  if ($scope.effectsEnabled.background) {
    effectsTracks.push({
      event: 'Set background',
      category: category,
      properties: {
        color: $scope.background
      }
    })
  }
  if ($scope.effectsEnabled.padding) {
    effectsTracks.push({
      event: 'Set padding',
      category: category,
      properties: {
        padding: $scope.padding
      }
    })
  }

  if (isRecolerIcon) {
    effectsTracks.push({
      event: 'Set color icon',
      category: category,
      properties: {
        color: $scope.iconColor
      }
    })
  }
  effectsTracks.forEach(function (item) {
    if (iconId) {
      item.properties.iconId = iconId
    }
    window._icons8Analytics.track(item)
  })
}
