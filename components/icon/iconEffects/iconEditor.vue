<template lang="pug">
  .icon-editor
    icon-toolbar(
      :icon="computedIcon"
      :iconSize="224"
      :class="{'is-open': effectsState}"
      @iconEffected="iconEffected"
    )
    icon-workspace(v-bind:icon="computedIcon")
      div(v-html="titleIcon")
    .icon-ads(:class="{'ads-hide': effectsState}")
      app-native-ads(type="card")
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'IconEditor',
  props: {
    titleIcon: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      sidebar: undefined,
      similar: undefined,
      related: undefined
    }
  },
  computed: {
    ...mapState({
      icon: state => state.icon.selectedIcon,
      fullIcon: state => state.icon.fullIcon,
      effectsState: state => state.ui.effects.active,
      iconsShrinked: state => state.ui.accordion.shrinked
    }),
    computedIcon () {
      return this.fullIcon.id ? this.fullIcon : this.icon
    }
  },
  methods: {
    ...mapActions([
      'selectIcon',
      'uploadIcons',
      'extendFullIcon',
      'expandIcons'
    ]),
    isSimilarOverflown () {
      // Checking if similar icons overflown on users screen
      if (this.similar) {
        return this.similar.scrollWidth > this.similar.clientWidth
      }
      return false
    },
    isRelatedOverflown () {
      // Checking if related icons overflown on users screen
      if (this.related) {
        return this.related.scrollWidth > this.related.clientWidth
      }
      return false
    },
    iconEffected (svgEffect) {
      this.extendFullIcon({ svgEffect })
    },
    select (variant) {
      this.extendFullIcon(Object.assign(
        { svgEffect: false, svgCurrentResolution: false },
        variant,
        { variants: this.fullIcon.variants }
      ))
    }
  }
}
</script>

<style lang="scss" scoped>
$grey: #F6F6F6;

  .icon-editor {
      display: flex;
      position: relative;
      background: $grey;
      padding: 40px 0 25px;
      margin: 0;
      @media (max-width: 997px) {
        margin: 0 -1rem;
      }
    }

    div.icon-toolbar {
      width: 165px;
      padding: 25px 20px 0 30px;
      transition: width .5s;
      z-index: 10;
      &.is-open {
        width: 454px;
      }
      @media (max-width: 1150px) {
        width: 75px;
        padding-left: 25px;
        padding-right: 25px;
      }
      @media (max-width: 870px) and (min-width: 800px) {
        display: none;
      }
      @media (max-width: 670px) {
        display: none;
      }
    }

    div.icon-workspace {
      flex: 1;
      padding: 30px 30px 15px 0;
      transition: all .3s;
      @media (max-width: 670px) {
        width: 100%;
        padding: 0 15px 15px 15px;
      }
      @media (max-width: 570px) {
        /deep/ div.download-icon.is-compact {
          display: none;
          &.is-mobile {
            display: block;
          }
        }
      }
      /deep/ .content {
        flex-direction: column;
        align-items: flex-start;
      }
// ---------right & left-----------------
      & /deep/ .right-side-workspace {
        margin-left: 0;
        @media (max-width: 1150px) {
          margin-top: 20px;
        }
        @media (max-width: 670px) {
          margin-top: -25px;
        }
        @media (max-width: 570px) {
          width: 100%;
          max-width: 100%;
          margin-top: 0;
        }
      }

      & /deep/ .left-side-workspace {
        & .icon {
          @media (max-width: 570px) {
            width: 200px;
            height: 200px;
            margin-left: 0;
          }
        }
        @media (max-width: 570px) {
          display: flex;
          justify-content: space-between;
          height: 160px;
          width: 100%;
          max-width: 420px;
          margin-bottom: 20px;
        }
      }
    }

    .icon-ads {
      position: relative;
      transition: opacity .3s, width .5s;
      &:before {
        content: '';
        width: 1px;
        position: absolute;
        top: 10px;
        bottom: 10px;
        left: 0;
        border-left: 1px solid rgba(0, 0, 0, 0.05);
        transition: left .3s .3s;
      }
      &.ads-hide {
        @media (max-width: 1360px) {
          opacity: 0;
          width: 0;
        }
      }
      & /deep/ .app-native-ads .card {
        margin: 30px 20px 20px;
        box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.1);
        @media (max-width: 997px) {
          display: none;
        }
      }
    }

</style>
