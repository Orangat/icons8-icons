<template lang="pug">
  .search-page
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

    .app-page-section.custom-padding(v-if="fetchComplete && !icons.length")
      nothing-found

    .app-page-section.custom-padding
      page-scroll(
      v-on:fetch="fetchNext"
      v-bind:is-disabled="isScrollDisabled"
      v-bind:is-loading="isLoading"
      )
        icon-grid(
        v-bind:icons="icons"
        v-bind:grid-style="gridStyle"
        v-bind:action="'select'"
        )
      request-icon(v-if="icons.length && allIconsLoaded")
</template>

<script>

import { mapState, mapActions } from 'vuex'

function fetchData ({ app, params, store, redirect, res }) {
  return new Promise(function (resolve) {
    const term = app.$utils.normalizeValue(params.term)
    store.dispatch('setPlatform', params.platform)
    const platform = store.state.platform.apiCode
    const beautyTerm = app.$utils.uppercaseFirstLetter(app.$utils.prettifyValue(term))
    if (!store.state.appInfo.platforms[platform] || platform === 'all') {
      redirect(`/icons/set/${term}`)
      return
    }
    let canonical = `${store.state.appInfo.backendUrl}/icon/set/${term}/${platform}`
    if (platform === 'all') {
      canonical = `${store.state.appInfo.backendUrl}/icon/set/${term}`
    }
    store.dispatch('updateSEO', {
      title: app.$t(`PLATFORMS.${platform}.SEARCH_TITLE`,
        { term: beautyTerm },
        `Free Icon, ${store.state.platform.title}`),
      description: app.$t('WEB_APP.SEO.SEARCH.DESCRIPTION', { term: beautyTerm }),
      canonical
    })

    store.dispatch('search', { term, platform, amount: 150 })
      .then(response => {
        if (res && (!response.icons || !response.icons.length)) {
          res.statusCode = 404
        }
        resolve({
          term,
          currentPlatform: params.platform,
          ...response,
          fetchComplete: true
        })
      })
      .catch(error => {
        console.error('page error', error && error.message ? error.message : error)
        resolve({
          term,
          currentPlatform: params.platform,
          icons: [],
          error: {
            message: error.message
          }
        })
      })
  })
}

export default {
  name: 'SearchPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect, res }) {
    if (process.server) {
      if (store.state.i18n.locale !== 'en-US') {
        app.head.link = app.head.link || []
        app.head.link = app.head.link.filter(link => !link.hreflang)
      }
      return fetchData({ app, params, store, redirect, res })
    }
    return {
      icons: [],
      error: undefined
    }
  },
  data () {
    return {
      icons: [],
      term: '',
      page: 1,
      isLoading: false,
      allIconsLoaded: false,
      fetchComplete: false,
      currentPlatform: undefined,
      fetchErrorsCount: 0
    }
  },
  computed: {
    ...mapState({
      iconsGridStyle: state => state.ui.iconsGridStyle,
      extendedIconsGridStyle: state => state.ui.extendedIconsGridStyle,
      mode: state => state.ui.mode,
      lang: state => state.i18n.locale,
      platform: state => state.platform,
      platforms: state => state.appInfo.platforms
    }),
    searchTitle () {
      const term = this.$route.params.term
      return this.$utils.uppercaseFirstLetter(this.$utils.prettifyValue(term))
    },
    title () {
      return this.$t(`PLATFORMS.${this.platform.apiCode}.SEARCH_TITLE`,
        { term: this.searchTitle },
        `${this.searchTitle} Icon, ${this.platform.title}`)
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
    this.$analytics.trackSearch({
      term: this.$route.params.term
    })
    if (!this.icons.length) {
      if (this.fetchComplete) {
        this.$analytics.track({
          event: 'Nothing found',
          category: this.$route.params.platform
        })
      }
      this.fetchData(this.$route.params)
    }
    if (this.$route.params.term !== this.term) {
      this.icons = []
      this.fetchData(this.$route.params)
    }
    this.checkError()
  },
  methods: {
    ...mapActions([
      'changeSelectPlatform'
    ]),
    description (platform) {
      const size = platform.size

      // All material icon platforms have the same description
      const isMaterial = [
        'androidL',
        'm_outlined',
        'm_rounded',
        'm_two_tone',
        'm_sharp'
      ].some(apiCode => platform.apiCode.indexOf(apiCode) > -1)
      const platformName = isMaterial ? 'androidL' : platform.apiCode

      return this.$t(`PLATFORMS.${platformName}.DESCRIPTION`, `<p>These icons are <a href="">pixel-perfect</a> at ${size}×${size} pixels and are available in PNG, SVG, and PDF. Unlike other websites, Icons8 creates most of these icons in-house, ensuring the stable quality.</p>`)
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
            this.icons = response.icons
            this.fetchComplete = true
            if (!this.icons.length) {
              this.$analytics.track({
                event: 'Nothing found',
                category: this.$route.params.platform
              })
            }
            this.checkError(response.error)
            resolve()
            this.$forceUpdate()
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
      const { term } = this.$route.params
      this.$store.dispatch('search', { term, amount: 150, page: this.page + 1 })
        .then(response => {
          this.page++
          if (response.icons.length) {
            response.icons.forEach(icon => {
              this.icons.push(icon)
            })
          } else {
            this.allIconsLoaded = true
          }
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.fetchErrorsCount++
          if (this.fetchErrorsCount === 3) {
            this.allIconsLoaded = true
          }
          console.error('page error', error && error.message ? error.message : error)
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

      const term = this.$route.params.term
      if (apiCode === 'all') {
        this.$router.push(`/icons/set/${term}`)
        return
      }
      this.$router.push(`/icon/set/${term}/${this.platforms[apiCode].seoCode}`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-page {
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
