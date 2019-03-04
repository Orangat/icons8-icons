import Vue from 'vue'

import analyticsPlugin from './analytics'
import createEnsureLoginPlugin from './ensureLogin'
import Vue2TouchEvents from 'vue2-touch-events'
import VueLazyload from 'vue-lazyload'

import app from '../layouts/app.vue'
import appAccordion from '../components/app/appAccordion.vue'
import appIconsMenu from '../components/app/appIconsMenu.vue'
import appLanding from '../layouts/app-landing.vue'
import appSearch from '../components/app/appSearch.vue'
import gridSelectorWrap from '../components/app/gridSelectorWrap.vue'
import menuList from '../components/app/menuList.vue'

import iconSidebar from '../components/icon/iconEffects/iconSidebar.vue'
import iconEditor from '../components/icon/iconEffects/iconEditor.vue'
import iconWorkspace from '../components/icon/iconEffects/iconWorkspace.vue'
import iconWorkspaceTwo from '../components/icon/iconEffects/iconWorkspaceTwo.vue'
import iconToolbar from '../components/icon/iconEffects/iconToolbar.vue'
import iconEffects from '../components/icon/iconEffects/iconEffects.vue'
import effectsSliding from '../components/icon/iconEffects/effectsSliding.vue'

import similarIcons from '../components/icon/similarIcons.vue'
import accordionRelatedIcons from '../components/icon/accordionRelatedIcons'
import downloadIcon from '../components/icon/downloadIcon.vue'
import downloadIconModal from '../components/icon/downloadIconModal.vue'
import downloadSelector from '../components/icon/downloadSelector.vue'
// import effectsModal from '../components/icon/iconEffects/effectsModal.vue' component have but not used
import generateHtml from '../components/icon/generateHtml.vue'
import appIcon from '../components/icon/appIcon.vue'
import iconRecolor from '../components/icon/iconRecolor.vue'
import iconTags from '../components/icon/iconTags.vue'
import iconResolutionSelector from '../components/icon/iconResolutionSelector.vue'
import relatedIcons from '../components/icon/relatedIcons.vue'
import appIconLogo from '../components/app/appIconLogo.vue'
import appAds from '../components/app/appAds.vue'
import colorPanel from '../components/app/colorPanel.vue'
import colorPicker from '../components/app/colorPicker.vue'
import rangeInput from '../components/app/rangeInput.vue'
import rangeSlider from '../components/app/rangeSlider.vue'

import gridSelector from '../components/grid/gridSelector.vue'
import iconGrid from '../components/grid/iconGrid.vue'

import collectionSidebar from '../components/collections/collectionSidebar.vue'
import collectionList from '../components/collections/collectionList.vue'
import collectionToolbar from '../components/collections/collectionToolbar.vue'
import collectionWorkspace from '../components/collections/collectionWorkspace.vue'
import downloadCollection from '../components/collections/downloadCollection.vue'
import downloadCollectionSelector from '../components/collections/downloadCollectionSelector.vue'
import appCollection from '../components/collections/appCollection.vue'
import requestIcon from '../components/app/requestIcon.vue'
import nothingFound from '../components/app/nothingFound.vue'
import autoComplete from '../components/app/autoComplete.vue'
import appExpand from '../components/app/appExpand.vue'
import appPage from '../components/app/appPage.vue'
import pageScroll from '../components/app/pageScroll.vue'
import Ripple from './ripple'

export default ({ store }) => {
  Vue.component('app', app)
  Vue.component('app-accordion', appAccordion)
  Vue.component('app-icons-menu', appIconsMenu)
  Vue.component('app-landing', appLanding)
  Vue.component('app-search', appSearch)
  Vue.component('grid-selector-wrap', gridSelectorWrap)
  Vue.component('menu-list', menuList)

  Vue.component('app-page', appPage)
  Vue.component('app-icon', appIcon)
  Vue.component('icon-recolor', iconRecolor)
  Vue.component('auto-complete', autoComplete)
  Vue.component('app-expand', appExpand)
  Vue.component('icon-tags', iconTags)
  Vue.component('icon-resolution-selector', iconResolutionSelector)
  Vue.component('related-icons', relatedIcons)
  Vue.component('app-icon-logo', appIconLogo)
  Vue.component('app-ads', appAds)
  Vue.component('color-panel', colorPanel)
  Vue.component('color-picker', colorPicker)
  Vue.component('range-input', rangeInput)
  Vue.component('range-slider', rangeSlider)

  Vue.component('icon-sidebar', iconSidebar)
  Vue.component('icon-editor', iconEditor)
  Vue.component('icon-toolbar', iconToolbar)
  Vue.component('icon-workspace', iconWorkspace)
  Vue.component('icon-workspace-two', iconWorkspaceTwo)
  Vue.component('download-icon', downloadIcon)
  Vue.component('download-icon-modal', downloadIconModal)
  Vue.component('download-selector', downloadSelector)
  // Vue.component('effects-modal', effectsModal)
  Vue.component('effects-sliding', effectsSliding)
  Vue.component('icon-effects', iconEffects)
  Vue.component('generate-html', generateHtml)
  Vue.component('similar-icons', similarIcons)
  Vue.component('accordion-related-icons', accordionRelatedIcons)

  Vue.component('grid-selector', gridSelector)
  Vue.component('icon-grid', iconGrid)

  Vue.component('collection-sidebar', collectionSidebar)
  Vue.component('collection-list', collectionList)
  Vue.component('collection-toolbar', collectionToolbar)
  Vue.component('collection-workspace', collectionWorkspace)
  Vue.component('download-collection', downloadCollection)
  Vue.component('download-collection-selector', downloadCollectionSelector)
  Vue.component('appCollection', appCollection)
  Vue.component('request-icon', requestIcon)
  Vue.component('nothing-found', nothingFound)
  Vue.component('page-scroll', pageScroll)

  Vue.use(Vue2TouchEvents)
  Vue.use(VueLazyload)
  Vue.use(createEnsureLoginPlugin(), { store })

  Vue.directive('ripple', Ripple)

  if (process.client) {
    Vue.use(analyticsPlugin, { store })
  }
}
