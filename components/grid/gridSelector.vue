<template lang="pug">
  .grid-selector
    .grid-selector-item(
      v-for="style in grids"
      v-html="style.icon"
      v-on:click="setGridStyle(style)"
      v-bind:class="itemClass(style)"
      v-bind:data-tooltip="style.tooltip" data-tooltip-bottom
    )
</template>

<script>

import { mapState, mapActions } from 'vuex'

export default {
  name: 'GridSelector',
  props: {
    extended: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      grids: [{
        name: 'icons',
        icon: this.$icons['grid/icons'],
        tooltip: this.$t('WEB_APP.GRID_TOOLTIP.ICONS'),
        extended: false
      }, {
        name: 'labels',
        icon: this.$icons['grid/labels'],
        tooltip: this.$t('WEB_APP.GRID_TOOLTIP.CLASSIC'),
        extended: false
      }, {
        name: 'grid',
        icon: this.$icons['grid/grid'],
        tooltip: this.$t('WEB_APP.GRID_TOOLTIP.GRID'),
        extended: true
      }]
    }
  },
  computed: {
    ...mapState({
      iconsGridStyle: state => state.ui.iconsGridStyle,
      extendedIconsGridStyle: state => state.ui.extendedIconsGridStyle
    }),
    gridStyle () {
      return this.extended ? this.extendedIconsGridStyle : this.iconsGridStyle
    }
  },
  methods: {
    ...mapActions([
      'setIconsGridStyle',
      'setExtendedIconsGridStyle'
    ]),
    setGridStyle (style) {
      if (this.extended) {
        this.setExtendedIconsGridStyle(style.name)
      } else if (this.isEnabled(style)) {
        this.setIconsGridStyle(style.name)
      }
    },
    isEnabled (style) {
      return !style.extended || this.extended
    },
    itemClass (style) {
      return {
        'is-active': this.gridStyle === style.name,
        'is-hidden': !this.isEnabled(style)
      }
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables';

  .grid-selector {
    height: 3rem;
    padding: 0.25rem 0.75rem;

    .grid-selector-item {
      display: inline-block;
      width: 2rem;
      height: 2.5rem;
      padding: 0.6rem 0;
      fill: rgb(76, 76, 76);
      cursor: pointer;
      transition: 0.3s all ease;

      &:not(:last-child) {
        margin-right: 1rem;
        @media (max-width: 1150px) {
          margin-right: 0;
        }
      }

      &:hover, &.is-active {
        fill: rgb(92, 163, 253);
      }

      &.is-hidden {
        display: none;
      }

      &>svg {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
