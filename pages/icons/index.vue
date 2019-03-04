<template lang="pug">
  .icons-page
    .app-page-section.custom-padding.is-video-preview
      .video-preview(v-on:click="videoPopup")
        .play(v-html="$icons.play")
        .video-title {{ $t('ICON.ICONS.INDEX.HOW_IT_WORKS') }}
        .video-duration 0:40

      h1.app-page-title.is-small.is-left(v-html="$t('WEB_APP.PAGE.LANDING.TITLE')")
      .app-page-subtitle.is-small.is-left(v-html="$t('WEB_APP.PAGE.LANDING.SUBTITLE')")

    app-video-popup(
      ref="videoPopup"
      v-bind:id="_uid"
      v-bind:videoWidth="800"
      v-bind:videoHeight="450"
      v-bind:videoId="`C4TcBmdaa-Q`"
      )

    .app-page-section.custom-padding
      .nothing-found(v-if="fetchComplete && !category")
        h2.nothing-found-title {{ $t('REQUEST_ICONS.NOT_FOUND.NOTHING', 'Nothing found') }}

    .app-page-section.custom-padding
      app-native-ads
      app-ads

    .app-page-section.custom-padding(v-if="platformIcons")
      h6.app-page-section-title {{ $t('ICON.ICONS.INDEX.POPULAR_STYLES') }}
      .preview-grid
        nuxt-link.preview-grid-item(
          v-bind:to="`/icons/${platformSeoCode(key)}`"
          v-for="(platform, key) in popularPlatforms"
          v-bind:key="key"
        )
          .preview-icons-grid
            .preview-icons-item(v-for="icon in platformIcons[key].slice(0, 8)")
              app-icon(v-bind:icon="icon")
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
            .preview-icons-item.is-empty
          .preview-grid-title {{ platformTitle(key) }}
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty

      h6.app-page-section-title {{ $t('ICON.ICONS.INDEX.OTHER_STYLES') }}
      .preview-grid(v-if="platformIcons")
        nuxt-link.preview-grid-item(
          v-bind:to="`/icons/${platformSeoCode(key)}`"
          v-for="(platform, key) in platformIcons" v-if="!popularPlatforms[key]"
          v-bind:key="key"
        )
          .preview-icons-grid
            .preview-icons-item(v-for="icon in platformIcons[key].slice(0, 8)")
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

function fetchData ({ app, params, store }) {
  return new Promise(function (resolve) {
    store.dispatch('setPlatform', 'all')

    store.dispatch('getPack', { pack: 'free-icons', amount: 380 })
      .then(response => {
        if (!response.success) {
          resolve({ error: { message: response.message }, fetchComplete: true })
          return
        }
        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.PAGE.LANDING.TITLE', 'Free Icons'),
          description: app.$t('WEB_APP.PAGE.LANDING.SUBTITLE', 'Get free icons designed to combine perfectly and fit into the style of your design.'),
          canonical: `${process.env.backendUrl}/icons`
        })
        resolve({
          ...response,
          fetchComplete: true
        })
      })
      .catch(error => {
        console.error('page error', error && error.message ? error.message : error)
        resolve()
        // resolve({
        //   error: {
        //     message: error.message
        //   }
        // })
      })
  })
}

export default {
  name: 'IconsPage',
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
        platformIcons[icon.platform].push(icon)
      })
      return platformIcons
    },
    requestIconUrl () {
      return `${process.env.backendUrl}/request-icon`
    }
  },
  mounted () {
    if (!this.category && !this.error) {
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
    },
    videoPopup () {
      this.$modal.show('video-popup' + this._uid)
    }
  }
}
</script>

<style lang="scss" scoped>
  .icons-page {
    .nothing-found {
      padding: 2rem;
      text-align: center;
      .nothing-found-title {
        font-size: 2rem;
      }
    }

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
      /deep/ svg {
        width: 100%;
        height: 100%;
      }
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

    .app-page-title {
      margin-top: 40px;
      margin-bottom: 4px;
    }
  }
</style>
