'use strict'

const getters = {
  isColorPlatform: (state) => (code) => {
    const platform = state.appInfo.platforms[code]
    return platform && platform.isColor
  }
}

export default getters
