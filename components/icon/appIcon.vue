<template lang="pug">
  .app-icon(
    v-if="isSVG"
    draggable="true"
    v-on:dragstart="dragStart"
    v-bind:style="iconStyle"
    v-bind:class="iconClasses"
    v-html="content"
  )
  .app-icon(
    v-else
    draggable="true"
    v-on:dragstart="dragStart"
    v-bind:style="iconStyle"
    v-bind:class="iconClasses"
  )
    template(v-if="lazy")
      img(v-bind:alt="alt || (name + ' icon')" v-bind:style="imgStyle" v-lazy="iconUrl")
    template(v-else)
      img(v-bind:alt="alt || (name + ' icon')" v-bind:style="imgStyle" v-bind:src="iconUrl")
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AppIcon',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    id: {
      type: Number,
      default: null
    },
    svg: {
      type: String,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    color: {
      type: String,
      default: null
    },
    platform: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: null
    },
    icon: {
      type: Object,
      default: null
    },
    lazy: {
      type: Boolean,
      'default': true
    },
    customSize: {
      'default': false
    },
    forcePng: {
      'default': false
    },
    effects: {
      'default' () {
        return []
      }
    }
  },
  data () {
    return { isSVG: false }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo ? state.appInfo.platforms : {}
    }),
    iconId () {
      return this.icon ? this.icon.id : this.id
    },
    iconUrl () {
      if (this.url) {
        return this.url
      }
      let size = '2x'
      if (this.customSize) {
        size = this.customSize * 2
      }
      let url
      if (this.icon && this.icon.commonName) {
        const platform = this.platforms[this.icon.platform]
        const seoCode = platform ? platform.seoCode : 'ios'
        const color = (this.color && this.color !== '000000') ? this.color + '/' : ''
        const commonName = this.icon.commonName
        url = `${process.env.iconsUrl}/${seoCode}/${size}/${color}${commonName}.png`
        return url
      }
      url = `${process.env.iconsUrl}/?id=${this.iconId}&size=${size}`
      if (this.color && this.color !== '000000') {
        url += `&color=${this.color}`
      }
      return url
    },
    name () {
      return this.icon ? this.icon.name : ''
    },
    content () {
      if (this.forcePng) {
        this.isSVG = false
        return ''
      }
      if (this.icon) {
        if (this.icon.svgEffect) {
          return this.icon.svgEffect
        }
        if (this.icon.svgCurrentResolution) {
          return this.icon.svgCurrentResolution
        }
        if (this.icon.svg) {
          return this.icon.svg
        }
      }
      if (this.svg) {
        return this.svg
      }
      if (this.iconId) {
        this.isSVG = false
      }
      return ''
    },
    iconPlatform () {
      return this.platform || (this.icon ? this.icon.platform : undefined)
    },
    imgStyle () {
      const style = {}
      if (!this.customSize && this.iconPlatform) {
        const platform = this.platforms[this.iconPlatform]
        if (platform) {
          let size = platform.size < 64 ? platform.size : 64
          style.width = style.height = `${size}px`
        }
      }
      return style
    },
    iconStyle () {
      const style = {}
      if (this.customSize) {
        style.width = `${this.customSize}px`
        style.height = `${this.customSize}px`
      }
      return style
    },
    iconClasses () {
      const classes = {
        [`is-${this.iconPlatform}`]: this.platform || this.icon,
        'is-custom-size': this.customSize,
        'is-loading': !this.iconId && !this.svg && !this.icon && !this.url
      }
      const effects = [].concat(this.effects)
      effects.forEach(effect => {
        classes[`is-effect-${effect}`] = true
      })
      return classes
    }
  },
  watch: {
    'icon': {
      handler () {
        if (this.icon) {
          if (this.icon.svg || this.icon.svgEffect || this.icon.svgCurrentResolution) {
            this.isSVG = true
          }
        }
      },
      deep: true
    }
  },
  mounted () {
    if (this.svg) {
      this.isSVG = true
      return
    }
    if (this.icon) {
      if (this.icon.svg || this.icon.svgEffect || this.icon.svgCurrentResolution) {
        this.isSVG = true
      }
      if (this.icon) {
        if (this.icon.svg || this.icon.svgEffect || this.icon.svgCurrentResolution) {
          this.isSVG = true
        }
      }
    }
  },
  methods: {
    dragStart (e) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        icon: this.icon,
        id: this.iconId,
        svg: this.content
      }))
    }
  },
  methods: {
    dragStart (e) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        icon: this.icon,
        id: this.iconId,
        svg: this.content
      }))
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables';
  @import '../../assets/css/mixins';

  .app-icon {
    position: relative;
    width: 80px;
    height: 66px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s all ease;

    .app-icon-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    svg {
      position: relative;
      width: 50px;
      height: 50px;
      transition: 0.2s all ease;
    }
    img {
      position: relative;
      transition: 0.2s all ease;
      max-width: 100%;
      max-height: 100%;

      &:not([src]) {
        display: none;
      }
    }

    &.is-unavailable {
      svg, img, .app-icon-effect {
        opacity: 0.35;
      }
    }

    &.is-small {
      width: 50px;
      height: 50px;
      svg, img, .app-icon-effect, .app-icon-content {
        width: 26px;
        height: 26px;
      }
    }

    &.is-tiny {
      width: 24px;
      height: 24px;
      svg, img, .app-icon-effect, .app-icon-content {
        width: 100%;
        height: 100%;
      }
    }
    .app-icon-effect {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &.is-effect-square {
      .app-icon-effect {
        border-radius: 12.5%;
        background-color: darken($color-grey-light, 2%);
      }
    }
    &.is-effect-round {
      .app-icon-effect {
        border-radius: 50%;
        background-color: darken($color-grey-light, 2%);
      }
    }
    &.is-effect-circle {
      .app-icon-effect {
        border-radius: 50%;
        border: 2px solid $color-grey;
      }
    }

    @mixin iconSize($size: 50px, $ratio: 1.5) {
      svg, img, .app-icon-content {width: $size; height: $size;}
      .app-icon-effect {width: $size*$ratio; height: $size*$ratio;}
    }

    &.is-ios, &.is-ios7 {
      @include iconSize()
    }
    &.is-ios11 {
      @include iconSize(30px)
    }
    &.is-win10 {
      @include iconSize(32px)
    }
    &.is-win8 {
      @include iconSize(26px, 1.5)
    }
    &.is-material, &.is-androidL {
      @include iconSize(24px, 1.5)
    }
    &.is-android, &.is-android4 {
      @include iconSize(24px, 1.5)
    }
    &.is-color {
      @include iconSize(48px)
    }
    &.is-office {
      @include iconSize(40px)
    }
    &.is-ultraviolet {
      @include iconSize(40px)
    }
    &.is-nolan {
      @include iconSize(64px)
    }
    &.is-p1em {
      @include iconSize(16px, 1.5)
    }
    &.is-dotty {
      @include iconSize(80px, 1.1)
    }
    &.is-dusk {
      @include iconSize(64px, 1.4)
    }
    &.is-Dusk_Wired {
      @include iconSize(64px)
    }
    &.is-cotton {
      @include iconSize(64px)
    }

    &.is-custom-size {
      svg, img, .app-icon-effect, .app-icon-content {width: 100%; height: 100%;}
    }

    &.is-inline {
      display: inline-block;
    }

    &.is-loading {
      @include loading;
    }
  }
</style>
