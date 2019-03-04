<template lang="pug">
  .icons-pack-page
    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left
        a(href="/icons") Icons
        span.separator &nbsp;/&nbsp;
        span {{ $t('WEB_APP.NEW_ICONS') }}
      .app-page-subtitle.is-small.is-left(v-html="$t('ICON.ICONS.NEW.NEW_PAGE_DESCRIPTION')")
    .app-page-section.custom-padding
      app-native-ads
      app-ads

    .app-page-section.custom-padding(v-if="platformIcons")
      h6.app-page-section-title {{ $t('ICON.ICONS.NEW.POPULAR_STYLES') }}
      .platforms
        nuxt-link.platform(
          v-bind:to="`/icon/new-icons/${platformSeoCode(key)}`"
          v-if="platformIcons[key]"
          v-for="(platform, key) in popularPlatforms"
          v-bind:key="key"
        )
          .icons
            .icon(v-for="icon in platformIcons[key]")
              app-icon(v-bind:icon="icon")
          .platform-title {{ platformTitle(key) }}

      h6.app-page-section-title {{ $t('ICON.ICONS.NEW.OTHER_STYLES') }}
      .platforms(v-if="platformIcons")
        nuxt-link.platform(
          v-bind:to="`/icon/new-icons/${platformSeoCode(key)}`"
          v-for="(platform, key) in platformIcons" v-if="!popularPlatforms[key]"
          v-bind:key="key"
        )
          .icons
            .icon(v-for="icon in platformIcons[key]")
              app-icon(v-bind:icon="icon")
          .platform-title {{ platformTitle(key) }}

</template>

<script>
import { mapState } from 'vuex'
import Vue from 'vue'

function fetchData ({ params, store, app }) {
  return new Promise(function (resolve) {
    store.dispatch('latest', { platform: 'all', amount: 800 })
      .then(response => {
        if (!response.success) {
          resolve({ error: { message: response.message }, fetchComplete: true })
          return
        }
        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.NEW_ICONS'),
          description: app.$t('WEB_APP.PAGE.LANDING.SUBTITLE', 'Get free icons designed to combine perfectly and fit into the style of your design.'),
          canonical: `${process.env.backendUrl}/icon/new-icons/all`
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
  asyncData ({ params, store, redirect, app }) {
    if (process.server) {
      return fetchData({ params, store, redirect, app })
    }
    return {
      error: undefined
    }
  },
  data () {
    return {
      icons: [],
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
      lang: state => state.i18n.locale
    }),
    platformIcons () {
      let platformIcons = {}
      if (this.icons) {
        this.icons.forEach(icon => {
          if (icon.filled) {
            return
          }
          platformIcons[icon.platform] = platformIcons[icon.platform] || []
          if (platformIcons[icon.platform].length < 8) {
            platformIcons[icon.platform].push(icon)
          }
        })
      }
      return platformIcons
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

    /deep/ .app-icon {
      width: 100%;
      height: 100%;
    }
  }
</style>
