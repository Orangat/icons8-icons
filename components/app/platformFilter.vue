<template lang="pug">
  .platform-filter
    app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_POPULAR')" ref="popularList")
      menu-list(
        v-bind:items="popularList"
        v-bind:isPlatforms="true"
        v-bind:submenuItems="withOutlined"
      )
    app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_OUTLINE')" ref="outlineList")
      menu-list(
        v-bind:items="outlineList"
        v-bind:isPlatforms="true"
        v-bind:customTitle="true"
      )
    app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_FILLED')" ref="filledList")
      menu-list(
        v-bind:items="filledList"
        v-bind:isPlatforms="true"
        v-bind:submenuItems="withoutOutlined"
      )
    app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_COLOR')" ref="colorList")
      menu-list(
        v-bind:items="colorList"
        v-bind:isPlatforms="true"
        v-bind:customTitle="true"
      )
    app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_TINY')" ref="tinyList")
      menu-list(
        v-bind:items="tinyList"
        v-bind:isPlatforms="true"
        v-bind:submenuItems="withOutlined"
      )
    .list
      nuxt-link.list-item(
        exact
        v-bind:to="'/icons'"
        v-text="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_ALL')"
      )
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PlatformFilter',
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms,
      platform: state => state.platform
    }),
    platformList () {
      return Object.keys(this.platforms).map(platform => {
        const pl = this.platforms[platform] || {}
        return {
          title: this.$t(`PLATFORMS.${pl.apiCode}.SHORT_TITLE`, pl.title),
          id: pl.apiCode,
          url: `/icons/${pl.seoCode}`
        }
      })
    },
    popularList () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'ios7' ||
            platform.id === 'ios11' ||
            platform.id === 'androidL' ||
            platform.id === 'win10' ||
            platform.id === 'p1em' ||
            platform.id === 'color' ||
            platform.id === 'wired'
          )
        }
      })
    },
    outlineList () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'ios7' ||
            platform.id === 'm_outlined' ||
            platform.id === 'win10' ||
            platform.id === 'wired' ||
            platform.id === 'dotty' ||
            platform.id === 'carbon_copy'
          )
        }
      })
    },
    filledList () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'ios11' ||
            platform.id === 'androidL' ||
            platform.id === 'p1em' ||
            platform.id === 'android' ||
            platform.id === 'win8'
          )
        }
      })
    },
    colorList () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'color' ||
            platform.id === 'office' ||
            platform.id === 'dusk' ||
            platform.id === 'ultraviolet' ||
            platform.id === 'nolan' ||
            platform.id === 'cotton' ||
            platform.id === 'doodle' ||
            platform.id === 'flat_round' ||
            platform.id === 'clouds' ||
            platform.id === 'bubbles' ||
            platform.id === 'plasticine'
          )
        }
      })
    },
    tinyList () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'p1em' ||
            platform.id === 'androidL' ||
            platform.id === 'ios11' ||
            platform.id === 'win10'
          )
        }
      })
    },
    withOutlined () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'androidL' ||
            platform.id === 'm_outlined' ||
            platform.id === 'm_rounded' ||
            platform.id === 'm_two_tone' ||
            platform.id === 'm_sharp'
          )
        }
      })
    },
    withoutOutlined () {
      return this.platformList.filter(platform => {
        if (platform) {
          return (
            platform.id === 'androidL' ||
            platform.id === 'm_rounded' ||
            platform.id === 'm_two_tone' ||
            platform.id === 'm_sharp'
          )
        }
      })
    },
    allPlatforms () {
      return this.platformList[0]
    }
  },
  watch: {
    platform () {
      this.openActiveStyleMenu()
    }
  },
  mounted () {
    this.openActiveStyleMenu()
  },
  methods: {
    openActiveStyleMenu () {
      const lists = [
        'popularList',
        'outlineList',
        'filledList',
        'colorList',
        'tinyList'
      ]
      lists.some(list => {
        let opened = false
        this[list].some(platform => {
          if (platform.id === this.platform.apiCode) {
            this.$refs[list].open()
            opened = true
            return true
          }
        })
        return opened
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.platform-filter {
  // Related to firefox bug, still not a 100% solution
  ::selection {
    background: none;
  }
  .app-expand {
    /deep/ .title {
      color: white;
      opacity: 1;
      letter-spacing: 0;
      text-transform: none;
      font-size: 16px;
      font-weight: 400;
      padding-left: 17px;
    }
    /deep/ .toggle {
      display: none;
    }
    /deep/ .submenu-toggle {
      display: inline;
      float: left;
    }
    /deep/ .content {
      .list {
        &.submenuList {
          padding-bottom: 0;
        }
        .app-expand {
          .title{
            font-size: 14px;
            line-height: 28px;
            padding-left: 26px;
            height: 28px;
          }
        }
        .list-item {
          padding-left: 40px;
          font-size: 14px;
          line-height: 28px;
          &.submenuListItem {
            padding-left: 48px;
          }
        }
      }
    }
  }
}
</style>
