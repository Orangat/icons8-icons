<template lang="pug">
  .download-icon-modal
    app-modal(
      ref="modal"
      v-bind:name="name"
      v-bind:width="480"
      v-bind:content-class="'is-big'"
    )
      h3.title(v-html="$t('WEB_APP.SINGLE_ICON.DOWNLOAD_BUTTON')")

      .formats
        .format(
          v-for="format in formats"
          v-bind:keys="format"
          v-bind:class="{'is-active': format === currentFormat}"
          v-on:click="selectFormat(format)"
        )
          .lock-icon(v-html="$icons.lock" v-if="!isAvailable({format})")
          | {{ format }}

      .content
        .sizes(v-if="isAvailable({format: currentFormat})")
          //Добавить в переводы
          p {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.CHOOSE_SIZES') }}
          .size(
            v-for="(size, index) in sizes"
            v-bind:keys="size.title"
            v-bind:class="sizeClasses(size)"
            v-on:click="selectSize(size, index, $event)"
          )
            app-popup.unlock-popup(
              v-bind:show-toggle="false"
              v-bind:position="'top-center'"
              v-if="!isAvailable({size: size.title})"
            )
              .lock-icon(v-html="$icons.lock" )
              | {{ size.title }}px
              div(slot="content")
                a(href="https://icons8.com/paid-license-99/") {{$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK')}}
                | {{ size.title }}px {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK_PRICE') }}
            div(v-else)
              | {{ size.title }}px
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
          .size(
            v-show="!customSizes"
            v-on:click="activateCustomSizes"
          ) {{$t('WEB_APP.DROPDOWN_SIZE.CUSTOM')}}

          p.width-info(v-if="sizes.length") {{sizes[0].title}}px is a <a href="https://icons8.com/articles/make-pixel-perfect-icons/">pixel perfect</a> size for this icon
        .paywall(v-else-if="!isAvailable({format: currentFormat})")
          .svg-paywall(v-if="currentFormat === 'svg'")
            .paywall-title {{$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK')}} SVG
            ul.paywall-list
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.SIZE_N_FORMAT') }}
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.APPS') }}:&nbsp;
                a(href="https://icons8.com/profile/downloads/") MacOS, Windows
              li.paywall-list-item No linking required
          .eps-paywall(v-else-if="currentFormat === 'eps'")
            .paywall-title {{$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK')}} EPS
            ul.paywall-list
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.SIZE_N_FORMAT') }}
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.APPS') }}:&nbsp;
                a(href="https://icons8.com/profile/downloads/") MacOS, Windows
              li.paywall-list-item No linking required
          .pdf-paywall(v-else-if="currentFormat === 'pdf'")
            .paywall-title {{$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK')}} PDF
            ul.paywall-list
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.SIZE_N_FORMAT') }}
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.APPS') }}:&nbsp;
                a(href="https://icons8.com/profile/downloads/") MacOS, Windows
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.NO_LINKING') }}
      //.separator

      .svg-format(v-if="options.format === 'svg' && platform && !platform.isColor")
        input.switch.is-mini(
          type="checkbox"
          id="download-selector-svg"
          v-model="isSimplified"
        )
        label(for="download-selector-svg")
          span(data-tooltip-multiline data-tooltip-left :data-tooltip="$t('WEB_APP.SINGLE_ICON.SIMPLIFIED_SVG_TOOLTIP')")
            | {{$t('WEB_APP.SINGLE_ICON.SIMPLIFIED_SVG')}}

      .button(
        v-if="isAvailable({format: currentFormat})"
        v-ripple
        v-on:click="download"
        v-bind:class="{'is-loading': isDownloading, 'is-disabled': isDisabled}"
      ) {{$t('WEB_APP.SINGLE_ICON.DOWNLOAD_BUTTON')}}
      .button(
        v-if="!isAvailable({format: currentFormat})"
      )
        a(href="https://icons8.com/paid-license-99/#/") Buy for $19.90/mo

    app-modal(
      ref="modal"
      name="buy-after-download-modal"
      v-bind:width="540"
      v-bind:content-class="'is-big'"
    )
      h3.title(v-html="buyPopup.title")
      .description(v-html="buyPopup.description")
      a.button(href="/buy") {{buyPopup.action}}
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'DownloadIconModal',
  props: {
    icon: {
      type: Object,
      'default': {}
    },
    name: {
      type: String,
      default: 'download-icon-modal'
    }
  },
  data () {
    return {
      formats: ['png', 'svg', 'eps', 'pdf'],
      currentFormat: '',
      selectedFormat: undefined,
      customSizes: false,
      customSize: 100,
      useCustomSize: false,
      platform: undefined,
      currentSize: 0,
      currentIndex: 0,
      sizes: [],
      isDownloading: false,
      isDisabled: false,
      multipleMode: false,
      buyPopup: {
        title: undefined,
        description: undefined,
        action: undefined
      }
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
    isSimplified: {
      get () {
        return this.options.isSimplified
      },
      set (value) {
        this.setSimplified(value)
      }
    },
    selectedSizes () {
      let sizes = this.sizes.filter(size => size.isSelected)
      if (this.useCustomSize && this.customSize > 0) {
        sizes.push({ title: this.customSize })
      }
      return sizes
    }
  },
  watch: {
    icon: {
      handler () {
        let sizeLimit = this.getSizeLimit(this.icon)
        if (this.customSize > sizeLimit) {
          this.customSize = sizeLimit
        }
        const oldPlatform = this.platform
        this.platform = this.platforms[this.icon ? this.icon.platform : 'all'] || this.platforms['all']
        if (oldPlatform.id !== this.platform.id) {
          this.sizes = this.platform.pngSizes
            .filter(size => !size.extra)
            .map(size => {
              return { title: size.title, isSelected: false }
            })
          if (!this.sizes[this.options.sizeIndex]) {
            this.currentIndex = this.sizes.length - 1
          }
          this.sizes[this.currentIndex].isSelected = true
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
      deep: true
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
    this.platform = this.platforms[this.icon ? this.icon.platform : 'all'] || this.platforms['all']
    this.sizes = this.platform.pngSizes
      .filter(size => !size.extra)
      .map(size => {
        return { title: size.title, isSelected: false }
      })
    if (this.sizes[this.options.sizeIndex]) {
      this.currentIndex = this.options.sizeIndex
    } else {
      this.currentIndex = this.sizes.length - 1
    }
    this.sizes[this.currentIndex].isSelected = true
    this.currentSize = this.sizes[this.currentIndex].title
    this.currentFormat = this.options.format
  },
  methods: {
    ...mapActions([
      'changeFormat',
      'changeSize',
      'changeSizeIndex',
      'setSimplified',
      'downloadIcon',
      'downloadCollection',
      'addIconToDownloadedCollection'
    ]),
    sizeClasses (size) {
      if (this.multipleMode) {
        return {
          'is-active': size.isSelected && this.isAvailable({ size: size.title })
        }
      } else {
        return {
          'is-active': size.title === this.currentSize && this.isAvailable({ size: size.title })
        }
      }
    },
    download () {
      if (this.disabled) {
        return
      }
      this.isDownloading = true
      this.$analytics.trackIconDownload({
        icon: this.icon,
        options: this.options
      })
      let downloading
      const sizes = this.selectedSizes
      if (sizes.length > 1) {
        downloading = this.downloadCollection({
          collection: {
            name: this.icon.name + '-' + sizes.map(size => size.title).join('-') + 'px'
          },
          icons: sizes.map(size => {
            return Object.assign({ size: size.title, iconId: this.icon.id }, this.icon)
          }),
          options: this.options
        })
      } else {
        const selectedSize = this.selectedSizes[0].title
        downloading = this.downloadIcon({
          icon: this.icon,
          options: {
            ...this.options,
            size: selectedSize
          }
        })
      }
      downloading
        .then(() => {
          this.isDownloading = false
          this.addIconToDownloadedCollection({ icon: this.icon })
          this.popupsOnDownload()
        })
        .catch(error => {
          this.isDownloading = false
          console.error(error)
        })
    },
    popupsOnDownload () {
      if (!this.user.isGuest && !this.user.activeLicense) {
        const firstDownload = localStorage.getItem('firstUnpaidDownload')
        if (!firstDownload) {
          localStorage.setItem('firstUnpaidDownload', 'true')
          this.buy()
        } else {
          if (this.random()) {
            this.buy()
          }
        }
      }
    },
    random () {
      return Math.floor(Math.random() * 3) === 0
    },
    buy () {
      const random = Math.floor(Math.random() * 6) + 1
      this.buyPopup.title = this.$t(`WEB_APP.PAID_FEATURES.TITLE_${random}`)
      this.buyPopup.description = this.$t(`WEB_APP.PAID_FEATURES.DESCRIPTION_${random}`)

      let buyString = ''
      switch (random) {
        case 1:
          buyString = `WEB_APP.PAID_FEATURES.BUY_1`
          break
        case 2:
          buyString = `WEB_APP.PAID_FEATURES.BUY_2`
          break
        case 3:
          buyString = `WEB_APP.PAID_FEATURES.BUY_1`
          break
        case 4:
          buyString = `WEB_APP.PAID_FEATURES.BUY_1`
          break
        case 5:
          buyString = `WEB_APP.PAID_FEATURES.BUY_3`
          break
        case 6:
          buyString = `WEB_APP.PAID_FEATURES.BUY_3`
          this.buyPopup.description = this.$t(`WEB_APP.PAID_FEATURES.DESCRIPTION_5`)
          break
      }
      this.buyPopup.action = this.$t(buyString, { price: '$19.90' })
      this.$modal.show('buy-after-download-modal')
    },
    selectFormat (format) {
      this.currentFormat = format
      if (this.isIconsAvailable({
        icon: this.icon,
        icons: this.icons,
        options: { format }
      })) {
        this.changeFormat(format)
      }
    },
    selectSize (size, index, e) {
      if (this.useCustomSize) {
        if (!(e.metaKey || e.ctrlKey)) {
          this.useCustomSize = false
        }
        this.sizes.forEach(size => {
          size.isSelected = false
        })
      }
      if (this.isAvailable({ size: size.title })) {
        if (e.metaKey || e.ctrlKey) {
          this.multipleMode = true
          size.isSelected = !size.isSelected
        } else {
          this.multipleMode = false
          this.sizes.forEach(size => {
            size.isSelected = false
          })
          size.isSelected = true
          this.currentSize = size.title
          this.currentIndex = index
          this.changeSizeIndex(index)
        }
      }
    },
    selectCustomSize () {
      this.useCustomSize = true
      if (this.customSize < 1) {
        this.customSize = 1
      }
      this.sizes.forEach(size => {
        size.isSelected = false
      })
      this.changeSize(this.customSize)
      this.currentSize = this.customSize
    },
    activateCustomSizes () {
      this.sizes.forEach(size => {
        size.isSelected = false
      })
      this.multipleMode = false
      this.customSizes = true
      this.selectCustomSize()
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
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';

  .download-icon-modal {}

  .formats {
    margin: 20px 0 24px;
  }

  .format {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    margin-right: 4px;
    border-radius: 4px;
    cursor: pointer;
    text-transform: uppercase;

    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0,0,0,0.04);
    }
    &.is-active {
      color: white;
      background-color: $color-blue;

      .lock-icon {
        fill: white;
      }
    }
  }

  .size {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    padding: 0 12px;
    margin-right: 4px;
    border-radius: 4px;
    cursor: pointer;

    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0,0,0,0.04);
    }
    &.is-active {
      color: white;
      background-color: $color-blue;

      .lock-icon {
        fill: white;
      }
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
      input {
        background-color: $color-blue;
        color: white;
      }
    }

    input {
      width: 70px;
      padding-right: 24px;
      color: #000;
      background: #fff;

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

  .paywall {
    .button a {
      color: #fff;
    }
  }

  .paywall-title {
    font-size: 20px;
    font-weight: 600;
  }

  .paywall-list {
    padding-left: 20px;
    margin: 0.5rem 0;
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
    & > /deep/ svg {
      width: 100%;
      height: 100%;
    }
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

  .content {
    background-color: #f4f4f4;
    margin: 0 -40px 32px;
    padding: 12px 42px 16px;

    &.is-radius {
      border-radius: 0 0 8px 8px;
    }
  }

  .svg-format {
    margin: -12px 0 20px;

    & > label > span {
      border-bottom: 1px dashed #ccc;
    }
  }

  .unlock-popup /deep/ .app-popup-content {
    width: 250px;
    overflow: visible;
    pointer-events: none;
    div {
      font-size: 14px;
      padding: 0 24px;
      margin: 8px 0;
    }
    a {
      pointer-events: all;
    }
  }

  .separator {
    height: 2px;
    border-top: 1px solid #eee;
    margin: 32px 0;
  }
</style>
