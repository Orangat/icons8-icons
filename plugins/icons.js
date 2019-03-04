'use strict'

function importAll (plugin, r) {
  r.keys().forEach(key => {
    plugin[key.split('./').join('').split('.svg').join('')] = `<svg width="100%" height="100%"><use xlink:href="#${r(key).default.id}"></use></svg>`
  })
}

export default () => {
  return {
    install (Vue) {
      const $icons = {}
      importAll($icons, require.context(`!!svg-sprite-loader!../assets/svg`, true, /\.*$/))
      Vue.prototype.$icons = $icons
      Vue.$icons = $icons
    }
  }
}
