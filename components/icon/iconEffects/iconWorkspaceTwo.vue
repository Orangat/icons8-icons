<template lang="pug">
  .icon-workspace.two
    .content
      .wrap-link-mobile
        nuxt-link.is-text.link-category(
          v-if="icon.platform"
          v-bind:to="categoryUrl"
          v-html="`${platformTitle} ${icon.category} ${subcategory}`")
        nuxt-link.is-text.link-title(
          v-if="icon.platform"
          v-bind:to="iconUrl"
          v-html="title")
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
        .title {{icon.name}}
        .wrap-link
          nuxt-link.is-text.link-category(
            v-if="icon.platform"
            v-bind:to="categoryUrl"
            v-html="`${platformTitle} ${icon.category} ${subcategory}`")
          nuxt-link.is-text.link-title(
            v-if="icon.platform"
            v-bind:to="iconUrl"
            v-html="title")

        download-icon(
          :icon="icon"
          :compact="true"
          :locale="lang"
          :isAccordion="true"
        )
    slot
</template>

<script>
import iconUtils from '~/plugins/iconUtils'

import { mapState } from 'vuex'

export default {
  name: 'IconWorkspaceTwo',
  serverCacheKey: () => 'IconWorkspaceTwo',
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
    iconUrl () {
      return iconUtils.getIconUrl(this.icon)
    },
    categoryUrl () {
      const pack = this.packs.find(pack => pack.name[this.lang] === this.icon.category)
      if (pack) {
        return `${iconUtils.getPackUrl(pack.code)}/${this.platform}`
      } else {
        return `/icon/new-icons/${this.platform}`
      }
    },
    platformTitle () {
      const id = this.icon.platform
      return (this.platforms[id] ? this.platforms[id].title : id) + ` ${this.$icons.breadCrumbArrow}`
    },
    subcategory () {
      return this.icon.subcategory ? `${this.$icons.breadCrumbArrow} ${this.icon.subcategory}` : ''
    },
    title () {
      return this.icon.synonim ? `${this.$icons.breadCrumbArrow} ${this.icon.synonim}` : `${this.$icons.breadCrumbArrow} ${this.icon.name}`
    },
    iconStyles () {
      return {
        fill: `#${this.$store.state.icon.color}`
      }
    }
  },
  watch: {
    'icon': {
      handler (newQuestion, oldQuestion) {
        if (this.showBreadcrumbs) {
          this.$store.dispatch('setPlatform', this.icon.platform)
        }
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
      padding-bottom: 25px;

      @media (max-width: 930px) {
        height: 220px;
      }
      @media (max-width: 460px) {
        flex-direction: column;
        height: auto;
      }
    }

    .title {
      color: #000000;
      font-size: 32px;
      font-weight: 600;
      line-height: 40px;
    }

    .link-category,
    .link-title {
      display: inline-block;
      min-height: 26px;
      min-width: 1px;
      color: #7C7C7C;
      fill: #98989A;
      vertical-align: top;
      margin-bottom: 14px;
      margin-right: 4px;
      transition: opacity .4s;
    }
    .link-title {
      &:hover {
        opacity: 0.8;
      }
    }

    .link-category {
      @media (max-width: 570px) {
        margin-bottom: 0;
      }
    }

    .icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 192px;
      height: 192px;
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
    height: 192px;

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
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    margin: 0 0 0 30px;
    transition: all .5s;
    width: 100%;

    @media (max-width: 1300px) {
      &.is-opacity {
        opacity: 0;
        transform: scale(0);
      }
    }

    @media (max-width: 570px) {
      max-width: 372px;
      margin: 0 0 0 20px;
    }
    @media (max-width: 460px) {
      margin: 0;
    }

    div.download-icon {
      margin: 0 auto 6px 0;
      &.is-compact {
        display: flex;
        @media (max-width: 460px) {
          display: none;
        }
      }
      /deep/ .button {
        margin-left: 0;
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
