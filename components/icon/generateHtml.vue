<template lang="pug">
  .generate-html
    app-modal.generate-html(
      v-bind:name="'generate-html'+id"
    )
      .menu
        .item(
          v-for="type in types"
          v-if="isTypeAvailable(type)"
          v-on:click="selectType(type)"
          v-bind:class="{'is-active': currentType === type.id, 'is-title': type.id === 'pngTitle' || type.id === 'svgTitle'}"
        ) {{type.name}}
      .preview
        .icon-wrapper
          .preview-icon
            .preview-wrapper
              .icon(
                v-if="currentType !== 'svgCss'"
                v-html="content.preview || content.result"
                v-bind:style="iconStyles"
              )
              .icon(
                v-if="currentType === 'svgCss'"
                v-html="content.preview"
                v-bind:style="iconStyles"
              )
          .sizes(v-if="isAvailable({format: currentFormat})")
            label Sizes
            .size(
              v-for="size in sizes"
              v-bind:keys="size.title"
              v-bind:class="{'is-active': currentSize === size.title, 'is-disabled': !isAvailable({size: size.title})}"
              v-on:click="selectSize(size)"
            )
              .lock-icon(v-html="$icons.lock" v-if="!isAvailable({size: size.title})")
              | {{ size.title }}px

            .size(
              v-show="!customSizes"
              v-on:click="activateCustomSizes"
            ) Custom
            .size.custom-size(
              v-show="customSizes"
              v-bind:class="{'is-active': useCustomSize}"
            )
              input(
                ref="customSize"
                v-model="customSize"
                v-on:keyup.enter="selectCustomSize()"
                v-bind:class="{'is-active': useCustomSize}"
              )
              .confirm-custom(
                v-html="$icons.save"
                v-on:click="selectCustomSize()"
                v-bind:class="{'is-active': useCustomSize}"
              )
            p.width-info(v-if="sizes.length") {{sizes[0].title}}px it a <a href="https://icons8.com/articles/make-pixel-perfect-icons/">pixel perfect</a> size for this icon
        .content
          template(v-if="currentType !== 'svgCss'")
            p.title {{ $t('WEB_APP.SINGLE_ICON.INSERT_SVG_IN_HTML') }}
            template(v-if="currentType !== 'pngCdn'")
              textarea(rows="9" v-model="content.result")

            template(v-if="currentType === 'pngCdn'")
              textarea(rows="3" v-model="content.result" style="margin-bottom: 0")
              p <a href="http://img.icons8.com/">Hack this URL</a><br><br>

            p.title(v-if="isPng" v-html="$t('WEB_APP.SINGLE_ICON.GENERATE_HTML_LINK')")
            textarea(rows="3" v-if="isPng" v-model="backLink")

          template(v-if="currentType === 'svgCss'")
            p.title {{ $t('WEB_APP.SINGLE_ICON.INSERT_SVG_IN_HTML') }}
            textarea(rows="2" v-model="content.html")

            p.title {{ $t('WEB_APP.SINGLE_ICON.INSERT_SVG_IN_CSS_CSS') }}
            textarea(rows="11" v-model="content.css")
</template>

<script>
import axios from '~/plugins/axios'
import iconUtils from '../../plugins/iconUtils'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'GenerateHtml',
  props: {
    icon: {
      type: Object,
      'default': undefined
    },
    id: {
      type: Number,
      'default': ''
    }
  },
  data () {
    return {
      show: false,
      min: 1,
      platform: undefined,
      currentSize: 0,
      currentFormat: '',
      sizes: [],
      currentType: 'pngCdn',
      useCustomSize: false,
      customSizes: false,
      customSize: 100,
      types: [{
        id: 'pngTitle',
        format: 'png',
        name: 'PNG OPTIONS'
      }, {
        id: 'pngCdn',
        format: 'png',
        name: 'CDN'
      }, {
        id: 'pngBase64',
        format: 'png',
        name: 'Base64'
      }, {
        id: 'svgTitle',
        format: 'svg',
        name: 'SVG OPTIONS'
      }, {
        id: 'svgInline',
        format: 'svg',
        name: 'Inline'
      }, {
        id: 'svgImg',
        format: 'svg',
        name: 'img tag'
      }, {
        id: 'svgCss',
        format: 'svg',
        name: 'Background'
      }],
      content: {
        preview: undefined,
        result: undefined,
        html: undefined,
        css: undefined
      },
      base64Cache: {}
    }
  },
  computed: {
    ...mapGetters(['getSizeLimit', 'isIconsAvailable']),
    ...mapState({
      user: state => state.auth.user,
      options: state => state.icon,
      platforms: state => state.appInfo.platforms
    }),
    size: {
      get () {
        return this.options.size
      },
      set (value) {
        this.changeSize(value)
      }
    },
    color: {
      get () {
        return this.options.color
      },
      set (value) {
        this.changeColor(value)
      }
    },
    isPng () {
      return this.currentType === 'pngBase64' || this.currentType === 'pngCdn'
    },
    backLink () {
      const name = this.$utils.normalizeValue(this.icon.name)
      return `<a href="https://icons8.com/icon/${this.icon.id}/${name}">${this.icon.name} icon by Icons8</a>`
    },
    iconStyles () {
      return {
        width: this.options.size + 'px',
        height: this.options.size + 'px'
      }
    },
    max () {
      return this.getSizeLimit(this.icon)
    }
  },
  watch: {
    icon () {
      this.base64Cache = {}
      const oldPlatform = this.platform
      this.platform = this.platforms[this.icon ? this.icon.platform : 'all'] || this.platforms['all']
      if (oldPlatform.id !== this.platform.id) {
        this.sizes = this.platform.pngSizes
          .filter(size => !size.extra)
          .map(size => {
            return { title: size.title, isSelected: false }
          })
      }
      if (this.platform === 'office') {
        // this.currentSize = this.options.resolution
        this.selectSize(this.options.resolution)
      } else {
        // this.currentSize = this.sizes[0].title
        this.selectSize(this.sizes[0])
      }
    },
    customSize (newValue) {
      this.customSize = parseInt(this.customSize)
      if (isNaN(this.customSize)) {
        this.customSize = ''
      }
      let sizeLimit = this.getSizeLimit(this.icon)
      if (newValue > sizeLimit) {
        this.customSize = sizeLimit
      }
    },
    'icon.svgEffect' () {
      this.base64Cache = {}
      if (this.icon.svgEffect) {
        this.currentType = 'svgInline'
      }
    },
    currentType (value) {
      if (value) {
        this.generateHtml()
      }
    },
    'options.size' (value) {
      if (value) {
        this.generateHtml()
      }
    },
    'options.color' (value) {
      if (value) {
        this.generateHtml()
      }
    }
  },
  mounted () {
    this.platform = this.platforms[this.icon ? this.icon.platform : 'all'] || this.platforms['all']
    this.sizes = this.platform.pngSizes
      .filter(size => !size.extra)
      .map(size => {
        return { title: size.title, isSelected: false }
      })
    this.currentSize = this.sizes[0].title
    this.currentFormat = this.options.format
  },
  methods: {
    ...mapActions([
      'changeSize',
      'changeColor',
      'getIconContentBySVG'
    ]),
    selectType (type) {
      this.currentType = type.id
    },
    isTypeAvailable (type) {
      if (this.icon.svgEffect) {
        if (type.id === 'pngCdn') {
          if (this.currentType === type.id) {
            this.currentType = 'pngBase64'
          }
          return false
        }
      }
      return this.isIconsAvailable({
        options: {
          size: this.options.size,
          format: type.format
        }
      })
    },
    togglePopup () {
      this.show = !this.show
    },
    closePopup () {
      this.show = false
    },
    outsideClick (e) {
      if (!this.$el.contains(e.target)) {
        this.closePopup()
      }
    },
    selectSize (size) {
      this.useCustomSize = false
      this.customSizes = false
      this.currentSize = size.title
      this.changeSize(size.title)
    },
    isAvailable (options) {
      if (this.icon && this.icon.imported) {
        return true
      }
      return this.isIconsAvailable({
        icon: this.icon,
        icons: this.icons,
        options
      })
    },
    selectCustomSize () {
      this.useCustomSize = true
      if (this.customSize < 1) {
        this.customSize = 1
      }
      this.changeSize(this.customSize)
      this.currentSize = this.customSize
    },
    activateCustomSizes () {
      this.customSizes = true
      this.selectCustomSize(true)
      setTimeout(() => {
        this.$refs.customSize.focus()
      }, 0)
    },
    getIconSVG (icon, options) {
      let svg = icon.svgEffect || icon.svg
      if (!svg) {
        return ''
      }
      const $svg = iconUtils.getSVGNode(svg)
      let innerHTML = $svg.innerHTML

      const viewBoxSvg = $svg.getAttribute('viewBox')
      const styleSvg = $svg.getAttribute('style')
      const svgBody = innerHTML.split('\n').join('')
      const svgStart = `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
width="${options.size}" height="${options.size}"
viewBox="${viewBoxSvg}"
style="${styleSvg ? styleSvg + ';' : ''} fill:#${options.color};">`

      const svgEnd = '</svg>'
      return svgStart + svgBody + svgEnd
    },
    generateHtml () {
      this[this.currentType](this.icon, this.options)
        .catch(console.log)
    },
    pngCdn (icon, options) {
      return this.pngBase64(icon, options, true)
    },
    pngBase64 (icon, options, cdn = false) {
      return new Promise((resolve, reject) => {
        if (!icon.commonName || icon.svgEffect) {
          this.pngFromSVGBase64(icon, options)
          resolve({})
          return
        }
        const platform = this.platforms[icon.platform]
        const seoCode = platform ? platform.seoCode : 'ios'
        const url = `${process.env.iconsUrl}/${seoCode}/${options.size}/${options.color}/${icon.commonName}.png`
        if (cdn) {
          this.content.result = `<img src="${url}">`
        }
        axios
          .request({
            url: url + '?press=off',
            baseURL: process.env.apiUrl,
            method: 'get',
            responseType: 'blob'
          })
          .then(response => {
            const reader = new FileReader()
            reader.onloadend = () => {
              this.content.preview = `<img src="${reader.result}">`
              this.content.result = cdn ? `<img src="${url}">` : this.content.preview
              resolve()
            }
            reader.readAsDataURL(response.data)
          })
          .catch(reject)
      })
    },
    pngFromSVGBase64 (icon, options) {
      return new Promise((resolve, reject) => {
        if (this.base64Cache[options.size]) {
          this.content.preview = this.base64Cache[options.size].preview
          this.content.result = this.content.preview
          resolve()
          return
        }
        this.getIconContentBySVG({
          svg: icon.svgEffect || icon.svg,
          format: 'png',
          size: options.size
        })
          .then(response => {
            const reader = new FileReader()
            reader.onloadend = () => {
              this.content.preview = `<img src="${reader.result}">`
              this.content.result = this.content.preview
              this.base64Cache[options.size] = {
                preview: this.content.preview
              }
              resolve()
            }
            reader.readAsDataURL(response.data)
          })
          .catch(reject)
      })
    },
    svgInline (icon, options) {
      return new Promise((resolve) => {
        this.content.preview = undefined
        this.content.result = this.getIconSVG(icon, options)
        resolve()
      })
    },
    svgImg (icon, options) {
      return new Promise((resolve) => {
        this.svgInline(icon, options)
          .then(() => {
            this.content.preview = undefined
            this.content.result = `<img src="data:image/svg+xml;base64,${window.btoa(this.content.result)}">`
            resolve()
          })
      })
    },
    svgCss (icon, options) {
      return new Promise((resolve) => {
        const name = this.$utils.normalizeValue(icon.name)
        this.svgInline(icon, options)
          .then(() => {
            const style = `
display: inline-block;
width: ${options.size}px;
height: ${options.size}px;
background: url('data:image/svg+xml;base64,${window.btoa(this.content.result)}') 50% 50% no-repeat;
background-size: 100%;`

            this.content.preview = `<div style="${style}"></div>`
            this.content.html = `<div class="icons8-${name}"></div>`
            this.content.css = `.icons8-${name} { ${style} }`
            resolve()
          })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/variables';

.generate-html {

    /deep/ .app-modal {
      display: flex;
      align-items: stretch;
      padding: 0;
      height: 570px;
      width: 700px;

    @media (max-width: 800px) {
      /*width: 100%;*/
    }
  }

  .menu {
    order: 0;
    flex: 0 0 165px;
    height: 100%;
    background-color: $left-sidebar-color;
    padding: 20px 8px;
    fill: #9B9B9B;
    border-radius: 8px 0 0 8px;
    font-size: 15px;
    @media (max-width: 470px) {
      flex: 0 0 135px
    }
    @media (max-width: 400px) {
      display: none;
    }
  }

  .is-disabled {
    pointer-events: none;
    padding: 0;
  }

  .size {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
    font-size: 16px;
    margin-right: 4px;
    border-radius: 4px;
    cursor: pointer;

    transition: all 0.3s ease;

    @media(max-width: 670px){
      font-size: 14px;
    }

    &:hover {
      background-color: rgba(0,0,0,0.04);
    }
    &.is-active {
      color: white;
      background-color: $color-blue;
    }
  }

  .lock-icon {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 2px;
    fill: #c8c8c8;
    & > /deep/ svg {
      width: 100%;
      height: 100%;
    }
  }

  .custom-size {
    position: relative;
    padding: 0;

    &.is-active {
      background: none;
    }

    input {
      width: 64px;
      padding-right: 24px;
      background-color: $color-blue;
      color: white;

      &:focus {
        background-color: white;
        color: #000;
        & + .confirm-custom {
          & > /deep/ svg {
            fill: $color-green;
          }
        }
      }
    }
  }

  .confirm-custom {
    position: absolute;
    top: 0;
    right: 0;
    width: 24px;
    height: 24px;
    padding: 4px;
    fill: transparent;
    transition: 0.3s all ease;
  }

  input {
    background: #f4f4f4;
    border: #f4f4f4;
    border-radius: 4px;
  }

  .width-info {
    margin-top: 15px;
    color: #777;
    font-size: 13px;
    font-weight: 300;
  }

  .item {
    height: 32px;
    line-height: 32px;
    padding-left: 12px;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.3s all ease;
    font-size: 14px;

    &:hover {
      color: $color-font-darkblue;
      fill: $color-font-darkblue;
    }

    &.is-divider {
      height: 1px;
      border-bottom: 1px solid $color-grey;
      margin: 6px 0;
    }

    &.is-title{
      color: #B4D5FF;
      letter-spacing: 2px;
      font-weight: 600;
      font-size: 12px;
      opacity: 0.5;
      pointer-events: none;
    }

    &.is-active {
      color: white;
      fill: white;
      background-color: rgba(92, 162, 253, 0.3);
      .icon-effects-svg {
        fill: $color-blue;
      }
    }
  }

  .sizes{
    display: inline-block;
    padding-top: 64px;
    @media (max-width: 670px) {
      padding-top: 35px;
    }
    @media (max-width: 570px) {
      padding-top: 0;
    }
    label {
      display: block;
      margin-bottom: 16px;
      font-weight: 500;
    }
  }

  .icon-wrapper{
    background: #F3F3F3;
    display: flex;
    @media (max-width: 570px) {
      flex-direction: column;
      align-items: center;
    }
  }

  .preview {
    order: 1;
    background-color: white;
    box-shadow: inset 3px 1px 2px -2px rgba(0, 0, 0, 0.25);
    border-radius: 0 8px 8px 0;
    width: 100%;
    overflow-y: auto;

    .content {
      padding: 36px 24px 0 24px;
      &>textarea {
        font-size: 12px;
        line-height: 1.3;
        border: none;
        border-radius: 0;
        margin-bottom: 8px;
        background: #F3F3F3;
        font-family: Monaco, monospace;
        resize: vertical;
        word-break: break-all;

        &:last-child {
          margin-bottom: 0;
        }
      }

      &>p {
        margin-top: 0;
        color: $color-font-dark;
        font-size: 14px;
      }

      &>.title {
        font-size: 18px;
        font-weight: 500;

        @media (max-width: 570px) {
          font-size: 15px;
        }
      }

      a, & /deep/ a {
        color: #0070ff;
      }
    }
  }

  .preview-icon {
    width: 144px;
    height: 144px;
    margin: 40px 24px 20px 26px;
    display: inline-flex;
    background: white;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    @media (max-width: 570px) {
      width: 100px;
      height: 100px;
      margin-bottom: 0px;
      margin-top: 30px;
    }
  }
  .preview-wrapper {
    display: flex;

    &>.icon {
      > /deep/ svg {
        width: 100%;
        vertical-align: top;
      }
      > /deep/ img {
        width: 100%;
        vertical-align: top;
      }
    }
  }
}
</style>
