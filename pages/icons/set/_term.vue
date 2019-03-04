<template lang="pug">
  .icons-search-page
    .app-page-section.custom-padding
      grid-selector-wrap(v-bind:extended="extendedGrid")
      h1.app-page-title.is-small.is-left
        a(href="/icons") {{ $t('ICON.ICONS.ICONS_LABEL') }}
        span.separator &nbsp;/
        = ' '
        span.capitalize {{ title }}

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

</template>

<script>
import { mapState } from 'vuex'

function fetchData ({ app, params, store, res }) {
  return new Promise(function (resolve) {
    const term = app.$utils.normalizeValue(params.term)
    const beautyTerm = app.$utils.uppercaseFirstLetter(app.$utils.prettifyValue(term))

    store.dispatch('search', { term, platform: 'all', amount: 150 })
      .then(response => {
        if (res && (!response.icons || !response.icons.length)) {
          res.statusCode = 404
        }

        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.SEO.SEARCH.TITLE_ALL', { term: beautyTerm }),
          description: app.$t('WEB_APP.SEO.SEARCH.DESCRIPTION', { term: beautyTerm }),
          canonical: `${process.env.backendUrl}/icon/set/${term}/all`
        })
        resolve({
          term,
          ...response,
          fetchComplete: true
        })
      })
      .catch(error => {
        console.error('page error', error && error.message ? error.message : error)
        resolve({
          term,
          error: {
            message: error.message
          }
        })
      })
  })
}

export default {
  name: 'IconsSearchPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect, res }) {
    if (process.server) {
      return fetchData({ app, params, store, redirect, res })
    }
    return {
      icons: [],
      error: undefined
    }
  },
  data () {
    return {
      term: undefined,
      icons: [],
      isLoading: false,
      page: 1,
      allIconsLoaded: false,
      activeGrid: undefined,
      fetchComplete: false,
      popularPlatforms: {
        ios7: true,
        ios11: true,
        androidL: true,
        color: true,
        win10: true,
        Dusk_Wired: true,
        p1em: true
      }
    }
  },
  computed: {
    ...mapState({
      seo: state => state.seo.data,
      platforms: state => state.appInfo.platforms,
      lang: state => state.i18n.locale,
      iconsGridStyle: state => state.ui.iconsGridStyle,
      extendedIconsGridStyle: state => state.ui.extendedIconsGridStyle
    }),
    title () {
      const term = this.$utils.uppercaseFirstLetter(this.$utils.prettifyValue(this.term))
      return this.$t(`WEB_APP.SEO.SEARCH.TITLE`, { term }, `${term} Icon`)
    },
    extendedGrid () {
      return this.$route.params.platform === 'all'
    },
    isScrollDisabled () {
      return this.isLoading || this.allIconsLoaded
    },
    gridStyle () {
      return this.extendedGrid ? this.extendedIconsGridStyle : this.iconsGridStyle
    }
  },
  mounted () {
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
      this.term = this.$route.params.term
      this.icons = []
      this.fetchData(this.$route.params)
    }
  },
  methods: {
    fetchData (params) {
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
            this.fetchComplete = response.fetchComplete
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
    checkError (error = this.error) {
      if (error) {
        console.log('this.error', this.error)
        this.error = undefined
      }
    },
    videoPopup () {
      this.$modal.show('video-popup' + this._uid)
    },
    fetchNext () {
      if (this.isLoading || this.allIconsLoaded) {
        return
      }
      this.isLoading = true
      const { term } = this.$route.params
      this.$store.dispatch('search', { term, platform: 'all', amount: 150, page: this.page + 1 })
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .icons-search-page {
    .app-page-section.is-video-preview {
      min-height: 208px;
    }

    .video-preview {
      float: left;
      width: 312px;
      height: 160px;
      padding-top: 32px;
      margin: 24px 32px 24px 0;
      border-radius: 6px;
      background: #fbefd9;
      text-align: center;
      cursor: pointer;
      @media (max-width: 600px) {
        float: none;
      }
    }

    .play {
      display: inline-block;
      width: 62px;
      height: 62px;
    }

    .video-title {
      font-size: 14px;
      font-weight: 600;
      color: #4C4C4C;
    }

    .video-duration {
      font-size: 14px;
      color: #999;
    }

    .platforms {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      margin: 0 -16px;
    }

    .platform {
      background: #f2f2f2;
      width: 312px;
      padding: 16px;
      margin: 16px;
      border-radius: 6px;
      display: flex;
      flex-flow: column;
      justify-content: space-between;
    }

    .platform-title {
      font-size: 16px;
      line-height: 16px;
      margin: 8px 12px;
      font-weight: 600;
      color: #4C4C4C;
    }

    .icons {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
    }

    .icon {
      display: flex;
      width: 50px;
      height: 50px;
      margin: 4px 10px;
    }

    // /deep/ .app-icon {
    //   width: 100%;
    //   height: 100%;
    // }
  }
</style>
