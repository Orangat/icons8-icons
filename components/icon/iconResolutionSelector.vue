<template lang="pug">
  .icon-resolution-selector
    .title {{ title }}
    .icons
      app-icon(
        v-for="(resolution, i) in icon.resolutions"
        v-bind:key="resolution.size"
        v-bind:svg="resolution.svg"
        v-bind:custom-size="resolution.size"
        v-on:click.native="currentIndex = i"
        v-bind:class="{'is-active': currentIndex === i}"
      )
    range-slider(
      v-bind:min="1"
      v-bind:max="maxRange-2"
      v-bind:step="1"
      v-model="currentRange"
    )
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'IconResolutionSelector',
  serverCacheKey: props => 'iconResolutionSelector',
  props: {
    icon: Object
  },
  data () {
    return {
      currentRange: 0,
      maxRange: 100,
      currentIndex: 0
    }
  },
  watch: {
    'icon.resolutions' () {
      this.icon.svgCurrentResolution = this.icon.resolutions[this.currentIndex].svg
    },
    currentRange () {
      this.currentIndex = Math.floor(this.currentRange / this.maxRange * this.amount)
    },
    currentIndex () {
      if (this.currentIndex !== Math.floor(this.currentRange / this.maxRange * this.amount)) {
        this.currentRange = Math.floor(this.currentIndex / this.amount * this.maxRange)
      }
      const resolution = this.icon.resolutions[this.currentIndex]
      this.icon.svgCurrentResolution = resolution.svg
      this.changeSize(resolution.size)
      this.changeResolution(resolution.size)
    }
  },
  computed: {
    ...mapState({
      resolution: state => state.icon.resolution
    }),
    amount () {
      return this.icon.resolutions.length
    },
    title () {
      return `${this.amount} levels of detail`
    }
  },
  mounted () {
    let found = false
    this.icon.resolutions.some((resolution, i) => {
      if (resolution.size === this.resolution) {
        this.currentIndex = i
        found = true
        return true
      }
    })
    if (!found) {
      this.currentIndex = this.amount - 2
    }
  },
  methods: {
    ...mapActions(['changeSize', 'changeResolution']),
    resolutionStyles (resolution) {
      return {
        'min-width': `${resolution.size}px`,
        'width': `${100 / this.amount - 1}%`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .icon-resolution-selector {
    max-width: 330px;
    @media (max-width: 1100px) {
      max-width: 280px;
    }

    .icons {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .app-icon {
      opacity: 0.3;
      cursor: pointer;

      &:hover {
        opacity: 0.6;
      }

      &.is-active {
        opacity: 1;
      }
    }

    .range-slider {
      width: 100%;
      margin: 0 auto;
    }
  }
</style>
