'use strict'

import * as types from './mutation-types'

export default {
  [types.SERVER_FAILED] (state, serverError) {
    state.serverError = serverError
  },
  [types.API_FAILED] (state, apiError) {
    state.apiError = apiError
  },
  [types.APP_INFO_LOADED] (state, appInfo) {
    state.appInfo = appInfo
    state.appInfo.packs.forEach(pack => {
      pack.code = this.$utils.normalizeValue(pack.code)
    })
  },
  [types.PLATFORM_CHANGED] (state, platformCode) {
    state.platform = state.appInfo.platforms[platformCode]
    if (!state.platform) {
      Object.keys(state.appInfo.platforms).some(key => {
        const platform = state.appInfo.platforms[key]
        if (platform.seoCode === platformCode) {
          state.platform = platform
          platformCode = platform.apiCode
          return true
        }
      })
    }
    if (!state.platform) {
      state.platform = { }
    }
  },
  [types.PACK_CHANGED] (state, packCode) {
    packCode = this.$utils.normalizeValue(packCode)
    const packs = state.appInfo.packs

    let currentPack = packs.find(pack => pack.code === packCode)
    if (!currentPack) {
      currentPack = packs.find(pack => pack.code === 'free-icons')
    }
    state.pack = currentPack
  },
  [types.SEO_PACK_CHANGED] (state, packCode) {
    packCode = this.$utils.normalizeValue(packCode)
    state.seoPack = state.appInfo.seoPacks.find(pack => pack.code === packCode)
  },
  [types.SEARCH_COLOR_CHANGED] (state, color) {
    state.color = color
  },
  [types.SEARCH_SHAPE_CHANGED] (state, shape) {
    state.shape = shape
  },
  [types.SEARCH_FORMAT_CHANGED] (state, format) {
    state.format = format
  },

  // around app ui
  [types.ICONS_GRID_STYLE_CHANGED] (state, style) {
    state.ui.iconsGridStyle = style
  },
  [types.EXTENDED_ICONS_GRID_STYLE_CHANGED] (state, style) {
    state.ui.extendedIconsGridStyle = style
  },
  [types.MODE_CHANGED_TO_ICON] (state) {
    state.ui.mode = state.ui.modes.ICON_MODE
  },
  [types.MODE_CHANGED_TO_COLLECTIONS] (state) {
    state.ui.mode = state.ui.modes.COLLECTIONS_MODE
  },
  [types.CORNER_AD_SHOWN] (state) {
    state.ui.cornerAd = true
  },
  [types.CORNER_AD_HIDDEN] (state) {
    state.ui.cornerAd = false
  },
  [types.EFFECTS_SHOWN] (state, effect) {
    state.ui.effects.active = effect
  },
  [types.EFFECTS_HIDDEN] (state) {
    state.ui.effects.active = false
  },
  [types.ICONS_EXPANDED] (state) {
    state.ui.accordion.shrinked = false
  },
  [types.ICONS_SHRINKED] (state) {
    state.ui.accordion.shrinked = true
  },

  // around sidebars
  [types.LEFT_SIDEBAR_ENABLED] (state) {
    state.ui.sidebars.left.enabled = true
  },
  [types.LEFT_SIDEBAR_DISABLED] (state) {
    state.ui.sidebars.left.enabled = false
  },
  [types.LEFT_SIDEBAR_SHOWN] (state) {
    state.ui.sidebars.left.active = true
  },
  [types.LEFT_SIDEBAR_HIDDEN] (state) {
    state.ui.sidebars.left.active = false
  },
  [types.RIGHT_SIDEBAR_ENABLED] (state) {
    state.ui.sidebars.right.enabled = true
  },
  [types.RIGHT_SIDEBAR_DISABLED] (state) {
    state.ui.sidebars.right.enabled = false
  },
  [types.RIGHT_SIDEBAR_SHOWN] (state) {
    state.ui.sidebars.right.active = true
  },
  [types.RIGHT_SIDEBAR_HIDDEN] (state) {
    state.ui.sidebars.right.active = false
  },
  [types.MOBILE_SEARCH_SHOWN] (state) {
    state.ui.mobileSearchActive = true
  },
  [types.MOBILE_SEARCH_HIDDEN] (state) {
    state.ui.mobileSearchActive = false
  },
  [types.SELECT_PLATFORM_CHANGED] (state) {
    state.ui.selectPlatformChanged = true
  },
  [types.SELECT_PLATFORM_RESET] (state) {
    state.ui.selectPlatformChanged = false
  }
}
