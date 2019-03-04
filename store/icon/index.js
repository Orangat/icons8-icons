'use strict'

import iconApi from '../api/icon'

const FORMAT_CHANGED = 'FORMAT_CHANGED'
const SIZE_CHANGED = 'SIZE_CHANGED'
const SIZE_INDEX_CHANGED = 'SIZE_INDEX_CHANGED'
const COLOR_CHANGED = 'COLOR_CHANGED'
const COLORS_MAP_CHANGED = 'COLORS_MAP_CHANGED'
const ICON_SELECTED = 'ICON_SELECTED'
const FULL_ICON_LOADED = 'FULL_ICON_LOADED'
const ICON_UNSELECTED = 'ICON_UNSELECTED'
const SET_MULTI_SIZE = 'SET_MULTI_SIZE'
const SET_SIMPLIFIED = 'SET_SIMPLIFIED'
const RESOLUTION_CHANGED = 'RESOLUTION_CHANGED'
const ICON_EXTENDED = 'ICON_EXTENDED'
const FULL_ICON_EXTENDED = 'FULL_ICON_EXTENDED'

const defaultIcon = {
  id: undefined,
  commonId: undefined,
  mainId: undefined,
  name: undefined,
  commonName: undefined,
  platform: undefined,
  category: undefined,
  subcategory: undefined,
  free: undefined,
  filled: undefined,
  variants: undefined,
  resolutions: undefined,
  svg: undefined,
  svgCurrentResolution: undefined,
  svgEffect: undefined,
  timestamp: undefined,
  url: undefined
}

const state = () => ({
  selectedIcon: Object.assign({ isSelectedIcon: true }, defaultIcon),
  fullIcon: Object.assign({ isFullIcon: true }, defaultIcon),
  format: 'png',
  size: 50,
  sizeIndex: 0,
  isMultiSize: false,
  isSimplified: true,
  color: '000000',
  resolution: 40,
  freeSizeLimit: 100,
  paidSizeLimit: 2048
})

const mutations = {
  [FORMAT_CHANGED] (state, format) {
    state.format = format
  },
  [SIZE_CHANGED] (state, size) {
    state.size = size
  },
  [SIZE_INDEX_CHANGED] (state, sizeIndex) {
    state.sizeIndex = sizeIndex
  },
  [COLOR_CHANGED] (state, color) {
    state.color = color.indexOf('#') === 0 ? color.slice(1) : color
  },
  [COLORS_MAP_CHANGED] (state, colorsMap) {
    state.colorsMap = colorsMap
  },
  [ICON_SELECTED] (state, icon) {
    state.selectedIcon = icon
  },
  [FULL_ICON_LOADED] (state, icon) {
    state.fullIcon = icon
  },
  [ICON_UNSELECTED] (state) {
    state.selectedIcon = defaultIcon
    state.fullIcon = defaultIcon
  },
  [SET_MULTI_SIZE] (state, isMultiSize) {
    state.isMultiSize = isMultiSize
  },
  [SET_SIMPLIFIED] (state, isSimplified) {
    state.isSimplified = isSimplified
  },
  [RESOLUTION_CHANGED] (state, resolution) {
    state.resolution = resolution || 40
  },
  [ICON_EXTENDED] (state, data) {
    state.selectedIcon = Object.assign(state.selectedIcon, data)
  },
  [FULL_ICON_EXTENDED] (state, data) {
    state.fullIcon = Object.assign(state.fullIcon, data)
  }
}

function syncLocalStorage (state) {
  if (!process.browser) {
    return
  }
  const options = {
    selectedIcon: state.selectedIcon,
    format: state.format,
    color: state.color,
    size: state.size,
    sizeIndex: state.sizeIndex,
    resolution: state.resolution,
    isSimplified: state.isSimplified
  }
  localStorage.setItem('options', JSON.stringify(options))
}

const actions = {
  changeFormat ({ commit, state }, format) {
    commit(FORMAT_CHANGED, format)
    syncLocalStorage(state)
  },
  changeSize ({ commit, state }, size) {
    commit(SIZE_CHANGED, size)
    syncLocalStorage(state)
  },
  changeSizeIndex ({ commit, state }, sizeIndex) {
    commit(SIZE_INDEX_CHANGED, sizeIndex)
    syncLocalStorage(state)
  },
  changeColor ({ commit, state }, color) {
    commit(COLOR_CHANGED, color)
    syncLocalStorage(state)
  },
  changeColorsMap ({ commit, state }, colorsMap) {
    console.log('changeColorsMap')
    commit(COLORS_MAP_CHANGED, Object.assign({}, colorsMap))
  },
  selectIcon ({ rootState, commit, state, dispatch }, icon) {
    return new Promise((resolve, reject) => {
      commit(ICON_SELECTED, icon)
      dispatch('getIcon', { id: icon.id })
        .then(response => {
          response.icon.synonim = icon.name
          commit(FULL_ICON_LOADED, response.icon)
          resolve()
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })
      syncLocalStorage(state)
    })
  },
  unselectIcon ({ commit, state }) {
    commit(ICON_UNSELECTED)
    syncLocalStorage(state)
  },
  setMultiSize ({ commit }, isMultiSize) {
    commit(SET_MULTI_SIZE, isMultiSize)
  },
  setSimplified ({ commit, state }, isSimplified) {
    commit(SET_SIMPLIFIED, isSimplified)
    syncLocalStorage(state)
  },
  changeResolution ({ commit, state }, resolution) {
    commit(RESOLUTION_CHANGED, resolution)
    syncLocalStorage(state)
  },
  extendFullIcon ({ commit }, data) {
    commit(FULL_ICON_EXTENDED, data)
  },
  loadFromLocalStorage ({ commit, getters }) {
    try {
      const options = JSON.parse(localStorage.getItem('options') || '{}')
      commit(FORMAT_CHANGED, options.format)
      commit(SIZE_INDEX_CHANGED, options.sizeIndex)
      commit(COLOR_CHANGED, options.color)
      commit(RESOLUTION_CHANGED, options.resolution)
      commit(SET_SIMPLIFIED, options.isSimplified)

      const sizeLimit = getters.getSizeLimit()
      if (options.size > sizeLimit) {
        commit(SIZE_CHANGED, sizeLimit)
      } else {
        commit(SIZE_CHANGED, options.size)
      }
    } catch (e) {
      console.error('sync from localStorage failed', e)
    }
  }
}

const getters = {
  getSizeLimit: (state, getters, rootState) => (icon = {}) => {
    if (icon.free) {
      return state.paidSizeLimit
    }
    if (rootState.auth.user.activeLicense) {
      return state.paidSizeLimit
    }
    let license
    if (rootState.auth.user.licenses) {
      license = rootState.auth.user.licenses[0]
    }
    if (license && icon.timestamp && icon.timestamp < license.expire) {
      return state.paidSizeLimit
    }
    return state.freeSizeLimit
  },
  isIconsAvailable: (state, getters, rootState) => ({
    icons,
    icon = state.selectedIcon,
    user = rootState.auth.user,
    options = {}
  }) => {
    icons = icons || [icon]
    // if user have active license then he has all rights
    if (user.activeLicense) {
      return icons
    }

    // compare with format or current icon state format
    const checkFormat = options.format || state.format
    // compare with size or current icon state size
    const checkSize = options.size || state.size

    // if png with small size then any icons is available
    if (checkFormat === 'png' && checkSize <= state.freeSizeLimit) {
      return icons
    }

    const availableIcons = []
    let license
    if (rootState.auth.user.licenses) {
      license = rootState.auth.user.licenses[0]
    }
    icons.forEach(icon => {
      // if it's free or user icon then it's available
      if (icon.free || icon.imported) {
        availableIcons.push(icon)
        return
      }
      // if icon was created before the expiration of last license
      if (license && icon.timestamp && icon.timestamp < license.expire) {
        // then we check format
        if (checkFormat === 'png') {
          availableIcons.push(icon)
          return
        }
        // or license features
        if (license.features.vector) {
          availableIcons.push(icon)
        }
      }
    })

    // if all icons available, then we can do anything with it
    if (availableIcons.length === icons.length) {
      return icons
    }

    // if no one icon available, then can do nothing with it
    if (availableIcons.length === 0) {
      return undefined
    }

    // if only part of icons available, then return this icons
    if (availableIcons.length < icons.length) {
      return availableIcons
    }
  }
}

const store = () => ({
  state,
  mutations,
  actions,
  getters
})

export default store
