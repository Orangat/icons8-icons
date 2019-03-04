<template lang="pug">
  .icon-workspace
    .content
      .wrap-link-mobile
          template(v-for="(value, i) in breadcrumbs")
            a.is-text.title(v-bind:href="value.url") {{ value.title }}
            span.is-text.title(v-if="i+1 < breadcrumbs.length" v-html="$icons.breadCrumbArrow")
      .left-side-workspace(:class="{'is-open': effectsState}")
        .icon
          template(v-if="icon.svg")
            app-icon(
              :key="1"
              :style="iconStyles"
              :icon="icon"
            )
          template(v-else)
            app-icon(
              :key="2"
              :style="iconStyles"
              :icon="icon"
            )
        download-icon.is-mobile(
          :icon="icon"
          :compact="true"
          :locale="lang"
          :isAccordion="true"
        )
      .right-side-workspace.clearfix(:class="{'is-opacity is-open': effectsState}")
        slot
        .wrap-link
          template(v-for="(value, i) in breadcrumbs")
            a.is-text.title(v-bind:href="value.url") {{ value.title }}
            span.is-text.title(v-if="i+1 < breadcrumbs.length" v-html="$icons.breadCrumbArrow")

        download-icon(
          :icon="icon"
          :compact="true"
          :locale="lang"
          :isAccordion="true"
        )
</template>

<script>
import iconUtils from '~/plugins/iconUtils'

import { mapState } from 'vuex'

export default {
  name: 'IconWorkspace',
  serverCacheKey: () => 'IconWorkspace',
  props: {
    icon: {
      type: Object,
      'default': {}
    }
  },
  data () {
    return {
      showAppStore: false,
      windowWidth: undefined,
      customSize: undefined
    }
  },
  computed: {
    ...mapState({
      packs: state => state.appInfo.packs,
      platformBreadcrumbs: state => state.platform,
      platform: state => state.platform.apiCode,
      platforms: state => state.appInfo.platforms,
      lang: state => state.i18n.locale,
      effectsState: state => state.ui.effects.active
    }),
    iconStyles () {
      return {
        fill: `#${this.$store.state.icon.color}`
      }
    },
    breadcrumbs () {
      const freeIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.FREE_ICONS'
      const webIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.WEB_ICONS'
      const iphoneIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.IPHONE_ICONS'
      const colorIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.COLOR_ICONS'
      const flatIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.FLAT_ICONS'
      const iconsForFreeCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.ICONS_FOR_FREE'
      const windowIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.WINDOW_ICONS'
      const freeVectorCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.FREE_VECTOR'
      const officeIconsCode = 'WEB_APP.VIEW_ICONS.BREADCRUMBS.OFFICE_ICONS'

      const pack = this.packs.find(pack => pack.name[this.lang] === this.icon.category)
      const breadcrumbs = [{
        url: process.env.backendUrl,
        title: this.$t(freeIconsCode)
      }, {
        url: this.platformBreadcrumbs.url,
        title: this.icon.platform
      }, {
        url: pack ? iconUtils.getPackUrl(pack.code) : '',
        title: this.icon.category
      }]
      if (this.icon.platformBreadcrumbs === 'win8') {
        breadcrumbs[1].title = this.$t(webIconsCode)
      }
      if (this.icon.platformBreadcrumbs === 'ios7') {
        breadcrumbs[1].title = this.$t(iphoneIconsCode)
      }
      if (this.icon.platformBreadcrumbs === 'color') {
        breadcrumbs[0].title = this.$t(flatIconsCode)
        breadcrumbs[1].title = this.$t(colorIconsCode)
      }
      if (this.icon.platformBreadcrumbs === 'win10') {
        breadcrumbs[0].title = this.$t(iconsForFreeCode)
        breadcrumbs[1].title = this.$t(windowIconsCode)
      }
      if (this.icon.platformBreadcrumbs === 'office') {
        breadcrumbs[0].title = this.$t(freeVectorCode)
        breadcrumbs[1].title = this.$t(officeIconsCode)
      }
      return breadcrumbs
    }
  },
  watch: {
    'icon': {
      handler (newQuestion, oldQuestion) {
        this.$store.dispatch('setPlatform', this.icon.platform)
      },
      deep: true
    }
  },
  mounted () {
    if (this.$utils.isMacOS()) {
      this.showAppStore = true
    }
    this.$nextTick(() => {
      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth
      })
    })
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/variables';
  @import '../../../assets/css/mixins';
  @import '../../../assets/css/breakpoints';

  $medium-width: $icon-workspace-medium-width;

  .icon-workspace {
    overflow: hidden;

    @media (max-width:  $responsive-effects-hide) {
      padding: 30px 15px 10px 15px;
    }

    .content {
      text-align: center;
      display: flex;

      @media (max-width: 460px) {
        flex-direction: column;
      }
    }

    /deep/ h1 {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 0.5px;
      line-height: 64px;
      text-align: left;
      margin: 37px 0 0;
      @media (max-width: 480px) {
        font-size: 36px;
        line-height: 48px;
      }
    }

    .title {
      display: inline-block;
      min-height: 26px;
      min-width: 1px;
      color: #7C7C7C;
      fill: #98989A;
      vertical-align: top;
      margin-bottom: 14px;
      margin-right: 4px;
      transition: opacity .4s;
      &:hover {
        opacity: 0.8;
      }
    }

    .category {
      display: inline-block;
      min-height: 26px;
      min-width: 1px;
      color: #7C7C7C;
      fill: #98989A;
      vertical-align: top;
      margin-bottom: 18px;
      margin-right: 4px;

      @media (max-width: 570px) {
        margin-bottom: 0;
      }
    }

    .icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 224px;
      height: 100%;
      margin: 0 auto;
      background: white;
      border-radius: 6px;

      @media (max-width: 570px) {
        width: 160px;
        height: 160px;
      }

      @media (max-width: 460px) {
        margin: 0;
        height: 100%;
      }

      &>.app-icon,
      &>.app-icon /deep/ > svg {
        width: 100%;
        height: 100%;
      }

      &>.app-icon /deep/ > img {
        width: 100% !important;
        height: 100% !important;
      }
    }

    .download-app {
      display: block;
      margin-top: 2px;
      &>img {
        width: 45%;
      }
    }
  }

  .left-side-workspace {
    width: auto;
    height: 224px;

    @media (max-width: 460px) {
      display: flex;
      justify-content: space-between;
      height: 160px;
      margin-bottom: 20px;
    }
    .download-icon {
      &.is-compact {
        &.is-mobile {
          display: none;
          @media (max-width: 460px) {
            display: inline;
          }
          margin: 0;
        }
        &.is-mobile /deep/ > .actions {
          display: flex;
          flex-direction: column;
          .button {
            margin-bottom: 15px;
            margin-right: 0;
          }
        }
      }
    }
  }

  .right-side-workspace {
    text-align: left;
    margin: 0 0 0 30px;
    transition: all .5s;
    width: 100%;

    @media (max-width: 570px) {
      max-width: 372px;
      margin: 0 0 0 20px;
    }
    @media (max-width: 460px) {
      margin: 0;
    }

    div.download-icon {
      margin-bottom: 6px;
      &.is-compact {
        display: flex;
        @media (max-width: 460px) {
          display: none;
        }
      }
      /deep/ .button {
        margin-bottom: 8px;
      }
    }
  }

  .wrap-link {
    white-space: nowrap;
    @media (max-width: 460px) {
      display: none;
    }
    svg,
    /deep/ svg {
      width: 12px;
      height: 12px;
    }
  }

  .wrap-link-mobile {
    display: none;
    text-align: initial;
    padding-left: 20px;
    @media (max-width: 460px) {
      display: block;
    }
    svg,
    /deep/ svg {
      width: 12px;
      height: 12px;
    }
  }

</style>
