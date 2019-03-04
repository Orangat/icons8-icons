<template lang="pug">
  .icon-toolbar
    icon-effects(
      :icon="icon"
      :iconSize="iconSize"
      @iconEffected="iconEffected")
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'IconToolbar',
  serverCacheKey: () => 'iconToolbar',
  props: {
    icon: {
      type: Object,
      'default': {}
    },
    iconSize: {
      type: Number,
      'default': 1920
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms,
      effectsState: state => state.ui.effects.active
    }),
    isColor () {
      if (this.icon && this.platforms[this.icon.platform]) {
        return this.platforms[this.icon.platform].isColor
      }
      return false
    },
    isImported () {
      return this.icon.imported
    }
  },
  methods: {
    iconEffected (svg) {
      this.$emit('iconEffected', svg)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/variables';
  @import '../../../assets/css/breakpoints';

  .icon-toolbar {
    position: relative;
    font-weight: 400;
    display: block;

    @media (max-width: $responsive-effects-hide) {
      display: none;
    }

    @media (max-width: $icon-workspace-effect-titles) {
      &:before {
        display: none;
      }
    }

    @media (max-width: $icon-workspace-medium-width) {
      width: 50px;
    }

    @media (max-width: $responsive-effects-hide) {
      position: absolute;
      right: 10px;
      border: none;
    }

    &:after,
    &:before {
      content: '';
      width: 1px;
      position: absolute;
      top: 10px;
      bottom: 10px;
      left: 70px;
      background-color: #F6F6F6;
      border-left: 1px solid rgba(0, 0, 0, 0.05);
      transition: all .3s .3s;
    }

    &:after {
      left: 194px;
      opacity: 0;
      transition-delay: 0s;
    }

    /deep/ .effect-title {
      opacity: 0;
      transition: opacity .3s .3s;
    }

    &.is-open {
      &:before {
        left: calc(100% - 30px);
      }
      &:after {
        opacity: 1;
        transition-delay: .3s;
      }
    }

    &:hover:not(.is-open) {
      /deep/ .item.init-effects .item-text {
        opacity: 1;
      }
      /deep/ .is-divider:after {
        width: 115px;
      }
      &:before {
        left: calc(100% - 20px);
      }
    }

    /deep/ .icon-recolor {
      display: block;
      position: relative;
      vertical-align: top;
      @media (max-width: $responsive-effects-hide) {
        margin-left: 0;
      }
    }
  }
</style>
