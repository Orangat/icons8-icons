<template lang="pug">
  .icons-new-page
    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left
        nuxt-link(v-bind:to="`/icons`") {{ $t('ICON.ICONS.ICONS_LABEL') }}
        span.separator &nbsp;/&nbsp;
        span(v-html="title")
      .app-page-subtitle.is-small.is-left(v-html="description")
      //.app-page-subtitle.is-small.is-left(v-html="features")

    .app-page-section.custom-padding
      app-native-ads
      app-ads

    .app-page-section.custom-padding
      .preview-grid(v-if="packsPreviews")
        nuxt-link.preview-grid-item(
          v-for="(icons, id) in packsPreviews"
          v-bind:to="`/icon/pack/${id}/${platform.seoCode}`"
          v-bind:key="id"
          v-if="freePacks[id]"
        )
          .badge.is-right Free SVG
          .preview-icons-grid
            .preview-icons-item(v-for="commonName in icons.slice(0, 8)")
              app-icon(v-bind:icon="{commonName, platform: platform.apiCode}")
          .preview-grid-title {{ packTitle(id) }}

        nuxt-link.preview-grid-item(
          v-bind:to="`/icon/pack/${id}/${platform.seoCode}`"
          v-for="(icons, id) in packsPreviews"
          v-bind:key="id"
          v-if="!freePacks[id]"
        )
          .preview-icons-grid
            .preview-icons-item(v-for="commonName in icons.slice(0, 8)")
              app-icon(v-bind:icon="{commonName, platform: platform.apiCode}")
          .preview-grid-title {{ packTitle(id) }}
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty
        .preview-grid-item.is-empty

</template>

<script>
import { mapState } from 'vuex'

function title (app, platform) {
  return app.$t(`PLATFORMS.${platform.apiCode}.TITLE`,
    `Free ${platform.title} Icons`)
}

function description (app, platform) {
  const size = platform.size
  return app.$t(`PLATFORMS.${platform.apiCode}.DESCRIPTION`, `<p>These icons are <a href="">pixel-perfect</a> at ${size}×${size} pixels and are available in PNG, SVG, and PDF. Unlike other websites, Icons8 creates most of these icons in-house, ensuring the stable quality.</p>`)
}

export default {
  name: 'IconsNewPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store }) {
    return new Promise(function (resolve) {
      store.dispatch('setPlatform', params.platform)
      const platform = store.state.platform
      const SEO = {
        title: title(app, platform),
        description: description(app, platform)
      }
      if (platform.preview) {
        SEO.image = platform.preview
      }
      store.dispatch('updateSEO', SEO)
      if (process.server) {
        resolve({
          packsPreviews: require(`../../libs/packsPreviews.json`)[platform.apiCode]
        })
      } else {
        import(/* webpackChunkName: "packsPreviews" */ `../../libs/packsPreviews.json`)
          .then(packsPreviews => {
            resolve({
              packsPreviews: packsPreviews[platform.apiCode]
            })
          }).catch(error => {
            console.error('Failed to load translation bundle', error)
            resolve({
              error: 'Failed to load packsPreviews bundle'
            })
          })
      }
    })
  },
  data () {
    return {
      packsPreviews: false,
      freePacks: {
        'free-icons': true,
        logos: true,
        characters: true
      }
    }
  },
  computed: {
    ...mapState({
      seo: state => state.seo.data,
      packs: state => state.appInfo.packs,
      platform: state => state.platform,
      lang: state => state.i18n.locale
    }),
    formattedPacks () {
      const formattedPacks = {}
      this.packs.forEach((pack, i) => {
        formattedPacks[pack.code] = this.packs[i]
      })
      return formattedPacks
    },
    title () {
      return title(this, this.platform)
    },
    description () {
      return description(this, this.platform)
    },
    features () {
      const size = this.platform.size
      return this.$t(`PLATFORMS.${this.platform.apiCode}.FEATURES`, `Based on ${size}×${size} px canvas`)
    }
  },
  methods: {
    packTitle (id) {
      let pack = this.formattedPacks[id]
      if (!pack) {
        return 'Icons'
      }
      return pack.name[this.lang] || pack.name['en-US']
    }
  }
}
</script>
