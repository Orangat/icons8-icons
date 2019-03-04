<template lang="pug">
  .similar-icons-wrap
    .similar-icons(v-bind:class="{'is-horizontal': isHorizontal}")
      template(v-if="icon && icon.variants && !isIconLoading && icon.variants.length > 1")
        template(v-if="navigate")
          nuxt-link.similar-icons-icon(
            v-for="variant in variants"
            v-bind:key="variant.id"
            v-bind:to="getUrl(variant)"
            v-on:click.native="loading(variant)"
            v-bind:class="{'is-loading': isLoading === variant.id}"
          )
            app-icon(
              v-bind:icon="variant"
              v-bind:custom-size="36"
              v-bind:lazy="false"
            )
            span {{ getPlatformTitle(variant) }}

        template(v-if="!navigate")
          .similar-icons-icon(
            v-for="variant in variants"
            v-bind:key="variant.id"
            v-on:click="select(variant)"
            v-bind:class="{'is-active': current === variant}"
          )
            app-icon(
              v-bind:icon="variant"
              v-bind:custom-size="36"
            )
            span {{ getPlatformTitle(variant) }}
</template>

<script>
import iconUtils from '~/plugins/iconUtils'
import { mapState } from 'vuex'

export default {
  name: 'SimilarIcons',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    icon: {
      type: Object,
      'default': undefined
    },
    isIconLoading: {
      type: Boolean,
      'default': false
    },
    navigate: {
      type: Boolean,
      'default': true
    },
    isHorizontal: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      isLoading: false,
      current: false
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms
    }),
    variants () {
      if (this.icon && this.icon.variants) {
        let variants = this.icon.variants
        return variants.concat().sort((a, b) => {
          let platformA = this.platforms[a.platform]
          let platformB = this.platforms[b.platform]
          if (platformA && platformB) {
            return platformA.order - platformB.order
          } else {
            return true
          }
        })
      } else {
        return []
      }
    }
  },
  watch: {
    $route () {
      this.isLoading = false
    },
    icon (newValue, oldValue) {
      if (newValue.id !== oldValue.id) {
        this.initCurrent()
      }
    }
  },
  created () {
    this.initCurrent()
  },
  methods: {
    getUrl (icon) {
      return iconUtils.getIconUrl(icon)
    },
    getPlatformTitle (icon) {
      const platform = this.platforms[icon.platform] || {}
      return this.$t(`PLATFORMS.${platform.apiCode}.SHORT_TITLE`, platform.title)
    },
    initCurrent () {
      this.variants.some(variant => {
        if (variant.id === this.icon.id) {
          this.current = variant
          return true
        }
      })
    },
    loading (icon) {
      if (this.icon.id !== icon.id) {
        this.isLoading = icon.id
      }
    },
    select (variant) {
      this.current = variant
      this.$emit('select', variant)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';
  @import '../../assets/css/mixins';

  .similar-icons-wrap {
    overflow: hidden;
  }

  .similar-icons {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: $similar-icons-width;
    background-color: #fafafa;
    box-shadow: inset 1px 0 0 0 #ececec;
    margin-bottom: 20px;

    &.is-responsive {
      @media (max-width: $responsive-app) {
        position: static;
        width: 100%;
        margin-top: 16px;
        padding-bottom: 4px;
        box-shadow: none;
        text-align: center;

        & > .similar-icons-icon {
          display: inline-block;
          padding: 8px 0 0;
          width: $similar-icons-width - 20px;
          height: $similar-icons-width - 20px;
          &.is-active {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          }
        }
      }
    }

    &.is-horizontal {
      position: relative;
      background: none;
      box-shadow: none;
      white-space: nowrap;

      & > .similar-icons-icon {
        display: inline-block;
        width: 88px;
        height: 88px;
        border-radius: 6px;
        transition: all 0.5s;
        margin-right: 5px;
        overflow: hidden;

        &.is-active {
          background: rgba(0, 0, 0, 0.05);
          box-shadow: none;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.03);
        }
      }
    }

    & > .similar-icons-icon {
      position: relative;
      display: block;
      padding: 23px 0 8px;
      width: $similar-icons-width;
      background: white;
      cursor: pointer;
      text-decoration: none;
      transition: 0.3s all ease;
      text-align: center;
      font-size: 12px;
      color: rgba(0, 0, 0, .5);
      border: none;

      &:hover {
        background-color: #f4f4f4;
      }
      &.is-active {
        background-color: white;
        box-shadow: inset 2px 0 0 0 #1a7cf9, inset 0 -1px 0 0 #ececec, inset 0 1px 0 0 #ececec;
      }
      &.is-loading {
        @include loading($size: 32px);
        & > .app-icon {
          opacity: 0.1;
        }
      }

      .app-icon {
        margin: 0 auto 8px;
        width: 36px;
        height: 36px;
      }
    }
  }
</style>
