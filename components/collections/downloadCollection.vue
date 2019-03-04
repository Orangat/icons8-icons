<template lang="pug">
  .download-collection
    .actions.button-group
      .button.is-thin(
        v-on:click="openDownloadModal"
      ) {{$t('WEB_APP.COLLECTIONS.DOWNLOAD_BUTTON')}}
    app-modal(
      name="download-options-modal"
      v-bind:content-class="'download-options-modal'"
      v-bind:width="480"
    )
      h3.title(v-html="$t('WEB_APP.SINGLE_ICON.DOWNLOAD_BUTTON')")
      .formats
        .format(
          v-for="(format, index) in formats"
          v-bind:keys="format"
          v-bind:class="{'is-active': format === currentFormat}"
          v-on:click="selectFormat(format)"
        )
          .lock-icon(v-html="$icons.lock" v-if="!isAvailable({format})")
          | {{ format }}
      .content
        .sizes(v-if="isCurrentFormatAvailable && currentFormat !== 'font'")
          p {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.CHOOSE_SIZES') }}
          .size(
            v-for="size in sizes"
            v-bind:keys="size.title"
            v-bind:class="sizeClasses(size)"
            v-on:click="selectSize(size, $event)"
          )
            app-popup.unlock-popup(
              v-bind:show-toggle="false"
              v-bind:position="'top-center'"
              v-if="!isAvailable({size: size.title})"
            )
              .lock-icon(v-html="$icons.lock" )
              | {{ size.title }}px
              div(slot="content")
                a(href="https://icons8.com/paid-license-99/") Unlock
                | {{ size.title }}px {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK_PRICE') }}
            div(v-else)
              | {{ size.title }}px

          .size(
            v-show="!customSizes"
            v-on:click="activateCustomSizes"
          ) {{$t('WEB_APP.DROPDOWN_SIZE.CUSTOM')}}
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

          // p.width-info(v-if="sizes.length") {{sizes[0].title}}px is a <a href="https://icons8.com/articles/make-pixel-perfect-icons/">pixel perfect</a> size for these icons
        p(v-if="isCurrentFormatAvailable && currentFormat === 'font'") {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.COLORED_FONT') }}
        .paywall(v-else-if="!isCurrentFormatAvailable")
            .paywall-title {{$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.UNLOCK')}} <span class="paywall-format">{{ currentFormat }}</span>
            ul.paywall-list
              li.paywall-list-item(v-html="$t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.SIZE_N_FORMAT')")
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.APPS') }}:&nbsp;
                a(href="https://icons8.com/profile/downloads/") MacOS, Windows
              li.paywall-list-item {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.NO_LINKING') }}
      .option-wrap(v-if="isCurrentFormatAvailable && currentFormat === 'svg'")
        .option-item
          input.option-zip(type="radio" name="download-option" value="zip" v-model="downloadWay" id="zip")
          label.option-text(for="zip") {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.ZIP') }}
        .option-item
          input.option-zip(type="radio" name="download-option" value="sprite" v-model="downloadWay" id="sprite")
          label.option-text(for="sprite") SVG sprite
      .actions.button-group.is-collection-button(v-if="isCurrentFormatAvailable")
        .button(
          v-on:click="choiceDownloadOption"
          v-bind:class="buttonClasses"
        ) Download collection
      .actions.button-group.is-collection-button(v-if="!isCurrentFormatAvailable")
        .button
          a(href="https://icons8.com/paid-license-99/#/") {{ $t('ICON.COMPONENTS.DOWNLOAD_COLLECTION.BUY') }}
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'DownloadCollection',
  data () {
    return {
      isDownloading: false,
      isSetDownloading: false,
      isFontDownloading: false,
      downloadWay: 'zip',
      sizes: [],
      formats: ['png', 'font', 'svg', 'eps', 'pdf'],
      currentFormat: 'png',
      currentSize: 50,
      currentIndex: 0,
      customSizes: false,
      customSize: 100,
      useCustomSize: false,
      multipleMode: false,
      singleMode: true
    }
  },
  computed: {
    ...mapGetters(['getSizeLimit', 'isIconsAvailable', 'isColorPlatform']),
    ...mapState({
      options: state => state.icon,
      user: state => state.auth.user,
      collection: state => state.collections.collection,
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
    selectedSizes () {
      let sizes = this.sizes.filter(size => size.isSelected)
      if (this.useCustomSize && this.customSize > 0) {
        sizes.push({ title: this.customSize })
      }
      return sizes
    },
    buttonClasses () {
      return {
        'is-loading': this.isDownloading,
        'is-disabled': !this.downloadWay
      }
    },
    isCurrentFormatAvailable () {
      return this.isAvailable({ format: this.currentFormat })
    }
  },
  watch: {
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
      .filter(size => !size.extra)
      .map(size => {
        return { title: size.title, isSelected: false }
      })
    if (this.currentIndex >= 0 && this.currentIndex < this.sizes.length) {
      this.sizes[this.currentIndex].isSelected = true
      this.currentSize = this.sizes[this.currentIndex].title
      this.currentFormat = this.options.format
    }
  },
  methods: {
    ...mapActions([
      'downloadCollection',
      'generateFont',
      'generateIconSet',
      'changeFormat',
      'changeSize'
    ]),
    openDownloadModal () {
      this.$modal.show('download-options-modal')
    },
    choiceDownloadOption () {
      this.$modal.hide('download-options-modal')
      if (this.currentFormat === 'svg' && this.downloadWay === 'sprite') {
        this.getSVGSet()
        return
      }
      if (this.currentFormat === 'font') {
        this.getFont()
        return
      }
      this.download()
    },
    selectFormat (format) {
      this.currentFormat = format
      this.changeFormat(format)
    },
    sizeClasses (size) {
      if (this.multipleMode) {
        return {
          'is-active': size.isSelected && this.isAvailable({ size: size.title })
        }
      } else if (this.singleMode) {
        return {
          'is-active': size.title === this.currentSize && this.isAvailable({ size: size.title })
        }
      }
    },
    isAvailable (options) {
      return this.isIconsAvailable({
        icons: this.collection.icons,
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
    selectSize (size, e) {
      if (this.isAvailable({ size: size.title })) {
        if (e.metaKey || e.ctrlKey) {
          this.singleMode = false
          this.multipleMode = true
          size.isSelected = !size.isSelected
        } else {
          this.multipleMode = false
          this.singleMode = true
          this.sizes.forEach(size => {
            size.isSelected = false
          })
          size.isSelected = true
          this.currentSize = size.title
        }
      }
    },
    activateCustomSizes () {
      this.customSizes = true
      this.selectCustomSize(true)
      setTimeout(() => {
        this.$refs.customSize.focus()
      }, 0)
    },
    getAvailableIcons (icons) {
      return this.isIconsAvailable({ icons })
    },
    download () {
      if (this.isDownloading) {
        return
      }
      console.log('this.collection.icons', this.collection.icons)
      const icons = this.getAvailableIcons(this.collection.icons)
      console.log('icons', icons)
      if (!icons || !icons.length) {
        this.$notify({
          title: this.$t('WEB_APP.COLLECTIONS.DOWNOLADING_FAILED'),
          text: this.$t('WEB_APP.COLLECTIONS.NO_AVAILABLE_ICONS'),
          type: 'warning'
        })
        return
      }
      this.isDownloading = true
      this.$analytics.track({
        event: 'Download a collection',
        category: 'Downloads'
      })
      console.log('this.sizes', this.sizes)
      const sizes = this.selectedSizes
      console.log('sizes', sizes)
      let formatedIcons = []
      icons.forEach(icon => {
        sizes.map(size => {
          formatedIcons.push(Object.assign({ size: size.title, iconId: icon.iconId }, icon))
        })
      })
      console.log('formatedIcons', formatedIcons)
      this.downloadCollection({
        collection: this.collection,
        icons: formatedIcons,
        options: this.options
      })
        .then(() => {
          this.isDownloading = false
        })
        .catch(error => {
          this.isDownloading = false
          console.log('error', error)
        })
    },
    getFont () {
      this.$ensureLogin()
        .then(() => {
          if (this.isFontDownloading) {
            return
          }
          const icons = this.getAvailableIcons(this.collection.icons)
          if (!icons || !icons.length) {
            this.$notify({
              title: this.$t('WEB_APP.COLLECTIONS.DOWNOLADING_FAILED'),
              text: this.$t('WEB_APP.COLLECTIONS.NO_AVAILABLE_ICONS'),
              type: 'warning'
            })
            return
          }
          if (this.hasColorIcons()) {
            this.$notify({
              title: this.$t('WEB_APP.COLLECTIONS.COLLECTION_COLOR_ICON_TITLE'),
              text: this.$t('WEB_APP.COLLECTIONS.COLLECTION_COLOR_ICON_DESCRIPTION'),
              type: 'warning',
              duration: 15000
            })
          }
          this.isFontDownloading = true
          this.$analytics.track({
            event: 'Generate a Font',
            category: 'Downloads'
          })
          this.generateFont({
            collection: this.collection,
            icons
          })
            .then(() => {
              this.isFontDownloading = false
            })
            .catch(error => {
              this.isFontDownloading = false
              console.log('error', error)
            })
        })
    },
    getSVGSet () {
      this.$ensureLogin()
        .then(() => {
          if (this.isSetDownloading) {
            return
          }
          const icons = this.getAvailableIcons(this.collection.icons)
          if (!icons || !icons.length) {
            this.$notify({
              title: this.$t('WEB_APP.COLLECTIONS.DOWNOLADING_FAILED'),
              text: this.$t('WEB_APP.COLLECTIONS.NO_AVAILABLE_ICONS'),
              type: 'warning'
            })
            return
          }
          this.isSetDownloading = true
          this.$analytics.track({
            event: 'Get SVG set',
            category: 'Downloads'
          })
          this.generateIconSet({
            collection: this.collection,
            icons
          })
            .then(() => {
              this.isSetDownloading = false
            })
            .catch(error => {
              this.isSetDownloading = false
              console.log('error', error)
            })
        })
    },
    hasColorIcons () {
      let result = false
      this.collection.icons.some(icon => {
        if (icon.platform && this.isColorPlatform(icon.platform)) {
          result = true
          return true
        }
      })
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';

  .download-collection {
    margin: -10px auto 0;
    padding: 10px 0 0 40px;
    @media (max-width: 580px) {
      margin: 0 0;
      padding-left: 0;
    }

    &:before {
      content: '';
      width: 1px;
      height: 120px;
      position: absolute;
      right: 0;
      top: 10px;
      background: rgba(0,0,0,0.1);;

      @media (max-width: 580px) {
        display: none;
      }
    }

    .is-disabled {
      pointer-events: none;
    }

    /deep/ .app-modal.download-options-modal {
      @media (max-width: 570px) {
        padding: 20px 15px;
      }
    }
  }

  /deep/ {

    .button-group {
      margin-top: 73px;
      position: relative;

      &.is-collection-button {
        margin-top: 35px;
      }

      @media (max-width: 580px) {
        margin-top: 0;
      }
    }

    .see-pricing-wrap {
      width: 252px;
      padding: 0 10px;
    }

    .actions {
      & > .button.is-thin {
        margin: 0 8px 8px 0;
        height: 32px;
        line-height: 29px;

        @media (max-width: 580px) {
          margin-right: 45px;
          float: right;
        }
      }

      & > .is-disabled {
        pointer-events: none;
      }

      & > .is-white {
        border: 2px solid rgba(74, 74, 74, .2);;
      }
    }

    .paywall {
      .button a {
        color: #fff;
      }
    }

    .paywall-format {
      text-transform: uppercase;
    }

    .paywall-title {
      font-size: 28px;
      font-weight: 600;
    }

    .paywall-list {
      padding-left: 20px;
    }

    .option-wrap {
      margin-top: 24px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgb(242, 242, 242);
    }

    .option-item {
      line-height: 20px;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: 400;
      color: #000000;

      &:last-child {
        margin-bottom: 0;
      }

      input {
        height: auto;
        margin-right: 8px;
        position: relative;
        top: -2px;
      }
    }

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
        background-color: rgba(0, 0, 0, 0.04);
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
    }

    .content {
      background-color: #f4f4f4;
      margin: 0 -32px 32px;
      padding: 12px 32px 16px;

      &.is-radius {
        border-radius: 0 0 8px 8px;
      }

      @media (max-width: 570px) {
        margin: 0 -15px 32px;
        padding: 12px 15px 16px;
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
        background-color: rgba(0, 0, 0, 0.04);
      }

      &.is-active {
        color: white;
        background-color: $color-blue;
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
  }
</style>
