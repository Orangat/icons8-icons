'use strict'

import * as types from './mutation-types'
import appInfo from '~/plugins/appInfo'

const actions = {
  setPlatform,
  setPack,
  setSeoPack,
  setSearchColor,
  setSearchShape,
  setSearchFormat,

  setIconsGridStyle,
  setExtendedIconsGridStyle,
  setIconMode,
  setCollectionsMode,

  showEffects,
  hideEffects,

  enableLeftSidebar,
  disableLeftSidebar,
  showLeftSidebar,
  hideLeftSidebar,

  enableRightSidebar,
  disableRightSidebar,
  showRightSidebar,
  hideRightSidebar,

  showMobileSearch,
  hideMobileSearch,
  changeSelectPlatform,
  resetSelectPlatform,

  showCornerAd,
  hideCornerAd,

  expandIcons,
  shrinkIcons,

  nuxtServerInit,
  nuxtClientInit
}

function setPlatform ({ commit }, platformCode) {
  commit(types.PLATFORM_CHANGED, platformCode)
}

function setPack ({ commit }, packCode) {
  commit(types.PACK_CHANGED, packCode)
}

function setSeoPack ({ commit }, packCode) {
  commit(types.SEO_PACK_CHANGED, packCode)
}

function setSearchColor ({ commit }, color) {
  commit(types.SEARCH_COLOR_CHANGED, color)
}

function setSearchShape ({ commit }, shape) {
  commit(types.SEARCH_SHAPE_CHANGED, shape)
}

function setSearchFormat ({ commit }, format) {
  commit(types.SEARCH_FORMAT_CHANGED, format)
}

function setIconsGridStyle ({ commit }, style) {
  commit(types.ICONS_GRID_STYLE_CHANGED, style)
}

function setExtendedIconsGridStyle ({ commit }, style) {
  commit(types.EXTENDED_ICONS_GRID_STYLE_CHANGED, style)
}

function setIconMode ({ commit }) {
  commit(types.MODE_CHANGED_TO_ICON)
}

function setCollectionsMode ({ commit }) {
  commit(types.MODE_CHANGED_TO_COLLECTIONS)
}

function showEffects ({ commit }, effect) {
  commit(types.EFFECTS_SHOWN, effect)
}

function hideEffects ({ commit }) {
  commit(types.EFFECTS_HIDDEN)
}

function enableLeftSidebar ({ commit }) {
  commit(types.LEFT_SIDEBAR_ENABLED)
}

function disableLeftSidebar ({ commit }) {
  commit(types.LEFT_SIDEBAR_DISABLED)
}

function showLeftSidebar ({ commit }) {
  commit(types.LEFT_SIDEBAR_SHOWN)
}

function hideLeftSidebar ({ commit }) {
  commit(types.LEFT_SIDEBAR_HIDDEN)
}

function showCornerAd ({ commit }) {
  commit(types.CORNER_AD_SHOWN)
}

function hideCornerAd ({ commit }) {
  commit(types.CORNER_AD_HIDDEN)
}

function enableRightSidebar ({ commit }) {
  commit(types.RIGHT_SIDEBAR_ENABLED)
}

function disableRightSidebar ({ commit }) {
  commit(types.RIGHT_SIDEBAR_DISABLED)
}

function showRightSidebar ({ commit }) {
  commit(types.RIGHT_SIDEBAR_SHOWN)
}

function hideRightSidebar ({ commit }) {
  commit(types.RIGHT_SIDEBAR_HIDDEN)
}

function expandIcons ({ commit }) {
  commit(types.ICONS_EXPANDED)
}

function shrinkIcons ({ commit }) {
  commit(types.ICONS_SHRINKED)
}

function showMobileSearch ({ commit }) {
  commit(types.MOBILE_SEARCH_SHOWN)
}

function hideMobileSearch ({ commit }) {
  commit(types.MOBILE_SEARCH_HIDDEN)
}

function changeSelectPlatform ({ commit }) {
  commit(types.SELECT_PLATFORM_CHANGED)
}

function resetSelectPlatform ({ commit }) {
  commit(types.SELECT_PLATFORM_RESET)
}

function nuxtServerInit ({ commit, state }, { req }) {
  commit(types.APP_INFO_LOADED, Object.assign({}, appInfo))
  commit(types.PLATFORM_CHANGED, 'all')
}

function nuxtClientInit ({ state, dispatch }) {
  dispatch('loadFromLocalStorage')
}

export default actions
