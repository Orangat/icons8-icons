<template lang="pug">
  .related-icons
    icon-grid(
      v-bind:class="{'is-active': isActive}"
      v-bind:icons="variants"
      v-bind:grid-style="'icons'")
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'RelatedIcons',
  serverCacheKey: props => props.icon.id,
  props: {
    icon: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      isActive: false,
      variants: []
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms
    })
  },
  watch: {
    icon (newValue, oldValue) {
      if (newValue.id !== oldValue.id) {
        this.getVariants()
      }
    }
  },
  mounted () {
    this.getVariants()
  },
  methods: {
    ...mapActions(['getSimilarIcons']),
    getVariants () {
      this.isActive = false
      let variants = []
      if (this.icon && this.icon.variants && this.icon.variants.length) {
        this.icon.variants.forEach(variant => {
          let code = variant.platform

          // if variant have platform code
          if (code) {
            let platform = this.platforms[code]

            // if there platform with this code
            if (platform) {
              // if its ios platform then we take only unfilled version for listing
              if (code !== 'ios7' || !variant.filled) {
                let iconVariant = {
                  id: variant.id,
                  code,
                  loaded: false,
                  current: code === this.icon.platform
                }
                iconVariant.order = platform.order
                iconVariant.title = platform.title
                variants.push(iconVariant)
              }
            }
          }
        })
      }

      variants.forEach((item, index) => {
        let platform = variants[index]
        if (platform && variants[index].current) {
          this.getSimilarIcons({ id: variants[index].id })
            .then(response => {
              this.variants = response.icons
              this.$forceUpdate()
              this.isActive = true
            })
            .catch(error => {
              console.error('error', error)
            })
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .related-icons {
    .icon-tags-title {
      display: inline-block;
      margin-right: 0.5rem;
    }

    .icon-grid {
      margin: 0 auto;
      opacity: 0;
      transition: all .3s;
      &.is-active {
        opacity: 1;
      }

      & /deep/ div.set {
        @media (max-width: 420px) {
          justify-content: center;
        }
      }

      & /deep/ div.icon.is-no-labels,
      & /deep/ a.icon-link,
      & /deep/ .icon div.app-icon {
        width: 79px;
        height: 79px;
      }

      & /deep/ div.icon.is-no-labels {
        margin: 0 48px 35px 0;
        @media (max-width: 420px) {
          margin: 0 10px 20px;
        }
      }

      & /deep/ .icon div.app-icon {
        margin: auto;
      }

      & /deep/ .icon .app-icon img {
        max-width: 32px;
        max-height: 32px;
      }

    }
  }
</style>
