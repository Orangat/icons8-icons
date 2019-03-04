<template lang="pug">
  .download-selector
    app-popup.popup(v-bind:position="popupPosition" ref="popup")
      .text {{ state }}
      div(slot="content")
        .options
          .format
            .list
              .list-item(
                v-for="(format, index) in formats"
                v-bind:keys="format"
                v-bind:class="{'is-active': format === currentFormat}"
                v-on:click="selectFormat(format, index)"
              )
                .lock-icon(v-html="svgIcons.lock" v-if="!isAvailable({format})")
                | {{ format }}

          .size
            .unlock-svg(v-if="!isAvailable({format: currentFormat})")
              .unlock-icon(v-html="svgIcons.colorLock")
              .unlock-title Unlock {{currentFormat.toUpperCase()}}
              a.button.is-tiny(v-on:click="seePricing") {{ $t('ICON.COMPONENTS.DONWLOAD_SELECTOR.PRICING') }}
              br
              a.login(v-on:click="login") {{ $t('ICON.COMPONENTS.DONWLOAD_SELECTOR.LOGIN') }}

            .list(v-if="isAvailable({format: currentFormat})")
              .list-item(
                v-for="(size, index) in sizes"
                v-bind:keys="size.title"
                v-bind:class="{'is-active': size.title === currentSize && !useCustomSize}"
                v-on:click="selectSize(size.title, index)"
              )
                .lock-icon(v-html="svgIcons.lock" v-if="!isAvailable({size: size.title})")
                template(v-if="isMultiSize")
                  input.switch.is-mini(
                    type="checkbox"
                    v-bind:id="size.title"
                    v-model="size.isSelected"
                  )
                  label(v-bind:for="size.title")
                | {{ size.title }}px
                .ratio x{{ Math.round(size.title / sizes[0].title * 10) / 10 }}
              .list-item.add-custom-size(
                v-show="!moreSizes"
                v-on:click="moreSizes = true"
              ) {{$t('WEB_APP.DROPDOWN_SIZE.MORE_SIZE')}}
              .list-item(
                v-show="moreSizes && !customSizes"
                v-on:click="activateCustomSizes"
              ) {{$t('WEB_APP.DROPDOWN_SIZE.CUSTOM')}}
              .list-item(
                v-show="customSizes"
                v-bind:class="{'is-active': useCustomSize}"
              )
                input.custom-size(
                  ref="customSize"
                  v-model="customSize"
                  v-on:keyup.enter="selectCustomSize()"
                  v-bind:class="{'is-active': useCustomSize}"
                )
                .confirm-custom(
                  v-html="svgIcons.save"
                  v-on:click="selectCustomSize()"
                  v-bind:class="{'is-active': useCustomSize}"
                )
            .multi(v-if="downloadMultiple")
              .list
                .list-item
                  input.switch.is-mini(
                    type="checkbox"
                    id="download-selector-multi"
                    v-model="isMultiSize"
                  )
                  label(for="download-selector-multi") {{$t('WEB_APP.DROPDOWN_SIZE.MULTIPLE')}}

    .svg-format(v-if="options.format === 'svg' && platform && !platform.isColor")
      input.switch.is-mini(
        type="checkbox"
        id="download-selector-svg"
        v-model="isSimplified"
      )
      label(for="download-selector-svg") {{$t('WEB_APP.SINGLE_ICON.SIMPLIFIED_SVG')}}
      span.svg-info(data-tooltip-multiline data-tooltip-left :data-tooltip="$t('WEB_APP.SINGLE_ICON.SIMPLIFIED_SVG_TOOLTIP')") ?
</template>

<script>
import save from '../../assets/svg/save.svg'
import lock from '../../assets/svg/lock.svg'
import colorLock from '../../assets/svg/colorLock.svg'
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'DownloadSelector',
  serverCacheKey: props => 'downloadSelector',
  props: {
    icon: {
      type: Object,
      'default' () {
        return undefined
      }
    },
    icons: {
      type: Array,
      'default' () {
        return undefined
      }
    },
    downloadMultiple: {
      type: Boolean,
      'default': false
    },
    popupPosition: {
      type: String,
      'default': 'top'
    },
    multiSize: {
      type: Boolean,
      'default': true
    }
  },
  data () {
    return {
      formats: ['png', 'svg', 'eps', 'pdf'],
      currentFormat: '',
      moreSizes: false,
      customSizes: false,
      customSize: 100,
      useCustomSize: false,
      platform: undefined,
      currentSize: 0,
      currentIndex: 0,
      sizes: [],
      svgIcons: {
        save,
        lock,
        colorLock
      }
    }
  },
  computed: {
    ...mapGetters(['isIconsAvailable', 'getSizeLimit']),
    ...mapState({
      user: state => state.auth.user,
      options: state => state.icon,
      platforms: state => state.appInfo.platforms
    }),
    state () {
      let size = this.currentSize
      if (this.isMultiSize) {
        size = this.selectedSizes.map(size => size.title).join(', ')
      }
      return `${this.options.format.toUpperCase()} ${size} px`
    },
    selectedSizes () {
      let sizes = this.sizes.filter(size => size.isSelected)
      if (this.useCustomSize && this.customSize > 0) {
        sizes.push({ title: this.customSize })
      }
      return sizes
    },
    isMultiSize: {
      get () {
        return this.multiSize && this.options.isMultiSize
      },
      set (value) {
        this.setMultiSize(value)
      }
    },
    isSimplified: {
      get () {
        return this.options.isSimplified
      },
      set (value) {
        this.setSimplified(value)
      }
    }
  },
  watch: {
    icon () {
      let sizeLimit = this.getSizeLimit(this.icon)
      if (this.customSize > sizeLimit) {
        this.customSize = sizeLimit
      }
      const oldPlatform = this.platform
      this.platform = this.platforms[this.icon ? this.icon.platform : 'all'] || this.platforms['all']
      if (oldPlatform.id !== this.platform.id) {
        this.sizes = this.platform.pngSizes
          .filter(size => this.moreSizes ? true : !size.extra)
          .map(size => {
            return { title: size.title, isSelected: false }
          })
        this.isMultiSize = false
      }
      if (this.platform === 'office') {
        this.currentSize = this.options.resolution
      } else {
        this.currentSize = this.sizes[this.currentIndex].title
      }
      if (this.useCustomSize) {
        this.currentSize = this.customSize
      }
    },
    icons () {
      if (this.icons.length) {
        this.platform = this.platforms[this.icons[0].platform] || this.platforms['all']
        this.sizes = this.platform.pngSizes
          .filter(size => this.moreSizes ? true : !size.extra)
          .map(size => {
            return { title: size.title, isSelected: false }
          })
        if (this.platform === 'office') {
          this.currentSize = this.options.resolution
        } else {
          this.currentSize = this.sizes[this.currentIndex].title
        }
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
    'options.size' () {
      this.currentSize = this.options.size
    }
  },
  mounted () {
    this.platform = this.platforms['all']
    this.sizes = this.platform.pngSizes
      .filter(size => this.moreSizes ? true : !size.extra)
      .map(size => {
        return { title: size.title, isSelected: false }
      })
    this.currentSize = this.sizes[this.currentIndex].title
    this.currentFormat = this.options.format
  },
  methods: {
    ...mapActions(['changeFormat', 'changeSize', 'setSimplified', 'setMultiSize']),
    selectFormat (format, index) {
      this.currentFormat = format
      if (this.isIconsAvailable({
        icon: this.icon,
        icons: this.icons,
        options: { format }
      })) {
        this.changeFormat(format)
      }
    },
    selectSize (size, index) {
      if (this.isMultiSize) {
        return
      }
      if (this.isIconsAvailable({
        icon: this.icon,
        icons: this.icons,
        options: { size }
      })) {
        this.useCustomSize = false
        this.changeSize(size)
        this.currentSize = size
        this.currentIndex = index
        this.$refs.popup.closePopup()
      }
    },
    selectCustomSize (keepPopup = false) {
      this.useCustomSize = true
      if (this.customSize < 1) {
        this.customSize = 1
      }
      this.changeSize(this.customSize)
      this.currentSize = this.customSize
      if (!keepPopup) {
        this.$refs.popup.closePopup()
      }
    },
    activateCustomSizes () {
      this.customSizes = true
      this.selectCustomSize(true)
      setTimeout(() => {
        this.$refs.customSize.focus()
      }, 0)
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
    login () {
      this.$refs.popup.closePopup()
      this.$modal.show('login-modal')
    },
    seePricing () {
      this.$analytics.track({
        event: 'Clicked Check Pricing',
        category: 'Ecommerce'
      })
      window.location.href = process.env.backendUrl + '/paid-license-99'
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';

  .download-selector {
    position: relative;
    display: inline-block;
    max-width: 100%;
    text-align: left;

    label {
      font-size: 12px;
      font-weight: 700;
    }

    .popup {
      position: static;
    }

    .text {
      height: 2.5rem;
      line-height: 2.5rem;
      color: $color-font-dark;
      margin-right: 20px;
      font-weight: 700;
    }

    .lock-icon {
      position: absolute;
      right: 10px;
      & > /deep/ svg {
        width: 12px;
        height: 12px;
        fill: #e0e0e0;
      }
    }

    .ratio {
      position: absolute;
      right: 1rem;
      top: 2px;
      font-size: 12px;
      font-weight: 300;
      color: #bbb;
    }

    .list {
      .list-item {
        line-height: 32px;

        &.is-active {
          background-color: #5CA3FD;
        }
      }
    }

    .options {
      display:flex;

      .list-item {
        padding-left: 10px;

        &.is-active {
          .lock-icon > /deep/ svg {
            fill: white;
          }
        }
      }
    }

    .format {
      display: inline-block;
      min-width: 80px;
      text-transform: uppercase;
    }

    .size {
      display: inline-block;
      min-width: 159px;
      border-left: 1px solid $color-grey-light;

      .lock-icon {
        right: 38px;
        line-height: 31px;
        top: 2.5px;
      }
    }

    .multi {
      border-top: 1px solid $color-grey-light;
    }

    .custom-size {
      height: 27px;
      width: 3rem;
      border: none;
      border-bottom: 1px solid $color-grey-light;
      padding: 0;
      border-radius: 0;
      background: none;

      &.is-active {
        color: white;
      }
    }

    .add-custom-size {
      margin: 5px 0;
    }

    .confirm-custom {
      display: inline-block;
      width: 24px;
      height: 24px;
      margin-top: 2px;
      vertical-align: top;
      border-radius: 50%;
      cursor: pointer;
      transition: 0.3s all ease;

      &.is-active {
        & > /deep/ svg {
          fill: white
        }
      }

      &:hover {
        background: rgba(230,230,230,0.5);
      }

      & > /deep/ svg {
        width: 16px;
        height: 16px;
        margin: 4px;
        fill: #9b9b9b;
      }
    }

    .svg-format {
      display: inline-block;
      margin-left: 0.75rem;
    }

    .svg-info {
      display: inline-block;
      margin-left: 0.25rem;
      width: 0.5rem;
      text-align: center;
      border-bottom: 1px dotted;
      cursor: default;
    }

    .unlock-svg {
      text-align: center;
      font-size: 14px;
      padding: 0.5rem 0 1rem;
    }

    .unlock-title {
      margin-bottom: 1rem;
    }

    .unlock-icon {
      & > /deep/ svg {
        width: 48px;
        height: 48px;
        vertical-align: top;
      }
    }

    .login {
      display: inline-block;
      margin-top: 0.25rem;
    }
  }
</style>
