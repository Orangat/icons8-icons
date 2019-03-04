'use strict'

const api = {
  resizeIcon,
  restoreIconSize
}

function resizeIcon (size) {
  const originalBoundsWidth = this.$.icon.originalBounds.width

  const $size = (originalBoundsWidth * (size || 100)) / 100 - originalBoundsWidth

  const pathRect = new this.paper.Path.Rectangle(this.$.icon.originalBounds.expand($size))

  if (this.$.svgIcon && this.$.svgIcon.fitBounds) {
    this.$.svgIcon.fitBounds(pathRect.bounds)
  }

  // const overlay = service.effects.overlay
  // if (overlay && overlay.active) {
  //   overlay.replaceIcon()
  // }

  this.$.removeElements(pathRect)
}

function restoreIconSize () {
  if (this.$.svgIcon && this.$.svgIcon.fitBounds) {
    this.$.svgIcon.fitBounds(this.$.icon.originalBounds)
  }

  // const overlay = service.effects.overlay
  // if (overlay && overlay.active) {
  //   overlay.replaceIcon()
  // }
}

export default api
