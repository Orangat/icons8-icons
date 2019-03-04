'use strict'

const api = {
  createShape
}

const shapeDefaults = {
  radius: 100,
  borderRadius: 100,
  borderWidth: 1,
  color: '#e44',
  fill: true
}

function createShape (options) {
  const paper = this.paper
  const params = Object.assign({}, shapeDefaults, options)

  params.radius = parseInt(params.radius, 10)
  if (isNaN(params.radius)) { params.radius = shapeDefaults.radius }
  const radius = (params.radius * (this.$.width / 2)) / 100

  params.borderRadius = parseInt(params.borderRadius, 10)
  if (isNaN(params.borderRadius)) { params.borderRadius = shapeDefaults.borderRadius }
  const borderRadius = (params.borderRadius * radius) / 100

  params.borderWidth = parseInt(params.borderWidth, 10)
  if (isNaN(params.borderWidth)) { params.borderWidth = shapeDefaults.borderWidth }
  params.borderWidth *= this.$.lineWidthIos
  const radiusStroke = radius - params.borderWidth

  if (params.fill) {
    return new paper.Path.Rectangle({
      point: [paper.view.center.x - radius, paper.view.center.y - radius],
      size: [radius * 2, radius * 2],
      radius: borderRadius,
      fillColor: params.color
    })
  }

  let shape = new paper.Path.Rectangle({
    point: [paper.view.center.x - radius, paper.view.center.y - radius],
    size: [radius * 2, radius * 2],
    radius: borderRadius
  })

  if (radiusStroke > 0) {
    shape = shape.subtract(new paper.Path.Rectangle({
      point: [paper.view.center.x - radiusStroke, paper.view.center.y - radiusStroke],
      size: [radiusStroke * 2, radiusStroke * 2],
      radius: borderRadius
    }))
  }

  shape.fillColor = params.color
  return shape
}

export default api
