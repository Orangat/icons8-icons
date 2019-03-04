<template lang="pug">
  .pack-page
    grid-selector-wrap(v-bind:extended="extendedGrid")

    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left
        nuxt-link(v-bind:to="'/icons'") {{ $t('ICON.ICONS.ICONS_LABEL') }}
        span.separator &nbsp;/&nbsp;
        .platforms
          app-select.is-breadcrumb(
            v-model="currentPlatform"
            v-bind:options="Object.values(platforms)"
            v-bind:title-key="'title'"
            v-bind:value-key="'apiCode'"
            v-on:change="selectPlatform"
          )
        span.separator &nbsp;/
        = ' '
        span.no-wrap(v-html="title")
      .app-page-subtitle.is-small.is-left(v-html="description(platform)")

    .app-page-section.custom-padding
      app-native-ads
      app-ads

    .app-page-section.custom-padding(v-if="fetchComplete && !category")
      nothing-found

    .app-page-section.custom-padding(v-if="category")
      page-scroll(
        v-on:fetch="fetchNext"
        v-bind:is-disabled="isScrollDisabled"
        v-bind:is-loading="isLoading"
      )
        div(v-for="subcategory in category.subcategory")
          h6.app-page-section-title {{ subcategory.name }}
          icon-grid(
            v-bind:icons="subcategory.icons"
            v-bind:grid-style="gridStyle"
            v-bind:id="subcategory.name"
            v-bind:action="'select'"
            v-bind:active-grid="activeGrid"
            v-on:activate="activateGrid"
          )
      request-icon(v-if="allIconsLoaded")
</template>

<script>
import { mapState, mapActions } from 'vuex'

function fetchData ({ app, params, store, redirect }) {
  return new Promise(function (resolve) {
    const pack = app.$utils.normalizeValue(params.pack)
    store.dispatch('setPack', pack)
    store.dispatch('setPlatform', params.platform)
    const platform = store.state.platform.apiCode
    if (!store.state.appInfo.platforms[platform] || platform === 'all') {
      redirect(`/icons/pack/${pack}`)
      return
    }
    const state = store.state
    const lang = state.i18n.locale
    const name = state.pack.name[lang] || state.pack.name['en-US']

    store.dispatch('getPack')
      .then(response => {
        if (!response.success) {
          resolve({ error: { message: response.message }, fetchComplete: true })
          return
        }
        let canonical = `${store.state.appInfo.backendUrl}/icon/pack/${pack}/${platform}`
        if (platform === 'all') {
          canonical = `${store.state.appInfo.backendUrl}/icon/pack/${pack}`
        }
        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.SEO.CATEGORY.TITLE_PACK', { categoryTitle: name }),
          description: app.$t('WEB_APP.SEO.CATEGORY.DESCRIPTION', { categoryTitle: name }),
          image: response.category.share_preview,
          canonical
        })
        resolve({
          currentPlatform: params.platform,
          ...response,
          fetchComplete: true
        })
      })
      .catch(error => {
        console.error('page error', error && error.message ? error.message : error)
        resolve({
          currentPlatform: params.platform,
          error: {
            message: error.message
          }
        })
      })
  })
}

export default {
  name: 'PackPlatformPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect }) {
    if (process.server) {
      return fetchData({ app, params, store, redirect })
    }
    return {
      category: undefined,
      error: undefined
    }
  },
  data () {
    return {
      isLoading: false,
      allIconsLoaded: false,
      page: 1,
      category: undefined,
      activeGrid: undefined,
      fetchComplete: false,
      currentPlatform: undefined
    }
  },
  computed: {
    ...mapState({
      seo: state => state.seo.data,
      iconsGridStyle: state => state.ui.iconsGridStyle,
      extendedIconsGridStyle: state => state.ui.extendedIconsGridStyle,
      platforms: state => state.appInfo.platforms,
      platform: state => state.platform,
      pack: state => state.pack,
      lang: state => state.i18n.locale
    }),
    subcategories () {
      return this.category ? (this.category || []) : []
    },
    title () {
      if (!(this.pack && this.pack.name)) {
        return
      }
      let title = this.pack.name[this.lang] || this.pack.name['en-US']
      title = this.$t(`PLATFORMS.${this.platform.apiCode}.CATEGORY_TITLE`, { title }, `${title} Icons, ${this.platform.title}`)
      if (this.pack.free) {
        return title + '<span class="badge is-big">Free SVG</span>'
      }
      return title
    },
    extendedGrid () {
      return this.$route.params.platform === 'all'
    },
    gridStyle () {
      return this.extendedGrid ? this.extendedIconsGridStyle : this.iconsGridStyle
    },
    isScrollDisabled () {
      return this.isLoading || this.allIconsLoaded
    }
  },
  watch: {
    platform () {
      this.currentPlatform = this.platform.apiCode
    }
  },
  mounted () {
    this.currentPlatform = this.platform.apiCode
    if (!this.category && !this.error) {
      this.fetchData(this.$route.params)
    }
  },
  updated () {
    if (this.category && this.$utils.isInViewport(this.$el)) {
      this.fetchNext()
    }
  },
  methods: {
    ...mapActions([
      'changeSelectPlatform'
    ]),
    description (platform) {
      const size = platform.size
      return this.$t(`PLATFORMS.${platform.apiCode}.DESCRIPTION`, `<p>These icons are <a href="">pixel-perfect</a> at ${size}×${size} pixels and are available in PNG, SVG, and PDF. Unlike other websites, Icons8 creates most of these icons in-house, ensuring the stable quality.</p>`)
    },
    activateGrid (key) {
      this.activeGrid = key
    },
    fetchData (params) {
      this.fetchComplete = false
      return new Promise((resolve) => {
        this.isLoading = true
        fetchData({
          app: this,
          store: this.$store,
          params
        })
          .then(response => {
            this.isLoading = false
            this.category = response.category
            this.fetchComplete = true
            resolve()
          })
          .catch(error => {
            this.isLoading = false
            console.error('error', error)
            this.checkError(error)
            resolve()
          })
      })
    },
    fetchNext () {
      if (this.isLoading || this.allIconsLoaded) {
        return
      }
      this.isLoading = true
      this.$store.dispatch('getPack', { page: this.page + 1 })
        .then(response => {
          this.page++
          this.isLoading = false
          if (response.success) {
            this.mergeCategories(this.category, response.category)
          } else {
            this.allIconsLoaded = true
            this.checkError(response.error)
          }
        })
        .catch(error => {
          this.isLoading = false
          console.error('page error', error && error.message ? error.message : error)
        })
    },
    mergeCategories (category1, category2) {
      category2.subcategory.forEach(sub2 => {
        const sub = category1.subcategory.find(sub1 => sub1.code === sub2.code)
        // if subcategory exist then just add icons from it
        if (sub) {
          sub.icons.push(...sub2.icons)
        // else add whole subcategory
        } else {
          category1.subcategory.push(sub2)
        }
      })
    },
    checkError (error = this.error) {
      if (error) {
        console.log('this.error', this.error)
        this.error = undefined
      }
    },
    selectPlatform (apiCode) {
      this.changeSelectPlatform()

      if (apiCode === 'all') {
        this.$router.push(`/icons/pack/${this.category.code}`)
        return
      }
      this.$router.push(`/icon/pack/${this.category.code}/${this.platforms[apiCode].seoCode}`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .pack-page {
    // remove empty spacer
    /deep/ .page-scroll .page-scroll-spacer:not(.is-loading) {
      height: auto;
    }
    .platforms {
      display: inline-block;
      width: auto;
    }
  }
</style>
