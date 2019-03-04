<template lang="pug">
  .icons-pack-page
    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left
        a(href="/icons") {{ $t('ICON.ICONS.ICONS_LABEL') }}
        span.separator &nbsp;/
        = ' '
        span.no-wrap(v-html="title")
      .app-page-subtitle.is-small.is-left(v-html="$t('WEB_APP.PAGE.LANDING.SUBTITLE', 'Get free icons designed to combine perfectly and fit into the style of your design.')")

    .app-page-section.custom-padding
      app-native-ads
      app-ads

    .app-page-section.custom-padding(v-if="platformIcons")
      h6.app-page-section-title {{ $t('ICON.ICONS.PACK.POPULAR_STYLES') }}
      .preview-grid
        nuxt-link.preview-grid-item(
          v-bind:to="`/icon/pack/${pack.code}/${platformSeoCode(key)}`"
          v-for="(platform, key) in popularPlatforms"
          v-bind:key="key"
        )
          .preview-icons-grid
            .preview-icons-item(
              v-for="icon in platformIcons[key]"
              v-bind:key="icon.id"
            )
              app-icon(v-bind:icon="icon")
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
          .preview-grid-title {{ platformTitle(key) }}
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty

      h6.app-page-section-title $t('ICON.ICONS.PACK.OTHER_STYLES')
      .preview-grid(v-if="platformIcons")
        nuxt-link.preview-grid-item(
          v-bind:to="`/icon/pack/${pack.code}/${platformSeoCode(key)}`"
          v-for="(platform, key) in platformIcons" v-if="!popularPlatforms[key]"
          v-bind:key="key"
        )
          .preview-icons-grid
            .preview-icons-item(
              v-for="icon in platformIcons[key]"
              v-bind:key="icon.id"
            )
              app-icon(v-bind:icon="icon")
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
          .preview-grid-title {{ platformTitle(key) }}
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty

</template>

<script>
import { mapState } from 'vuex'
import Vue from 'vue'

function fetchData ({ app, params, store }) {
  return new Promise(function (resolve) {
    const pack = params.pack
    store.dispatch('setPack', pack)

    store.dispatch('getPack', { platform: 'all', amount: 800 })
      .then(response => {
        if (!response.success) {
          resolve({ error: { message: response.message }, fetchComplete: true })
          return
        }
        const state = store.state
        const lang = state.i18n.locale
        const name = state.pack.name[lang] || state.pack.name['en-US']
        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.SEO.TITLE', { title: name }),
          description: app.$t('WEB_APP.PAGE.LANDING.SUBTITLE', 'Get free icons designed to combine perfectly and fit into the style of your design.'),
          canonical: `${process.env.backendUrl}/icon/pack/${pack}/all`,
          image: response.category.share_preview
        })
        resolve({
          ...response,
          fetchComplete: true
        })
      })
      .catch(error => {
        console.error('page error', error && error.message ? error.message : error)
        resolve({
          error: {
            message: error.message
          }
        })
      })
  })
}

export default {
  name: 'IconsPackPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect }) {
    if (process.server) {
      return fetchData({ app, params, store, redirect })
    }
    return {
      error: undefined
    }
  },
  data () {
    return {
      category: undefined,
      isLoading: false,
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
      platform: state => state.platform.apiCode,
      platforms: state => state.appInfo.platforms,
      pack: state => state.pack,
      lang: state => state.i18n.locale
    }),
    platformIcons () {
      if (!this.category) {
        return
      }
      let icons = this.category.subcategory.map(subcategory => subcategory.icons)
      icons = [].concat.apply([], icons)
      let platformIcons = {}
      icons.forEach(icon => {
        if (icon.filled) {
          return
        }
        platformIcons[icon.platform] = platformIcons[icon.platform] || []
        if (platformIcons[icon.platform].length < 8) {
          platformIcons[icon.platform].push(icon)
        }
      })
      return platformIcons
    },
    title () {
      if (!(this.pack && this.pack.name)) {
        return
      }
      let title = this.pack.name[this.lang] || this.pack.name['en-US']
      title = this.$t('WEB_APP.SEO.TITLE', { title })
      if (this.pack.free) {
        return title + '<span class="badge is-big">Free SVG</span>'
      }
      return title
    }
  },
  mounted () {
    if (!this.category && !this.error) {
      this.fetchData(this.$route.params)
    }
    if (this.category && this.$route.params.pack !== this.category.code) {
      this.category = undefined
      this.fetchData(this.$route.params)
    }
  },
  methods: {
    platformTitle (id) {
      return this.platforms[id] ? this.platforms[id].fullTitle : id
    },
    platformSeoCode (id) {
      return this.platforms[id] ? this.platforms[id].seoCode : id
    },
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
            this.category = response.category
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .icons-pack-page {
    .nothing-found {
      padding: 2rem;
      text-align: center;
      .nothing-found-title {
        font-size: 2rem;
      }
    }
  }
</style>
