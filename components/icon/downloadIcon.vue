<template lang="pug">
  .download-icon(
    v-bind:class="{'is-compact': compact}"
  )
    .actions.button-group
      .button(
        v-ripple
        v-on:click="openDownloadModal"
      ) {{$t('WEB_APP.SINGLE_ICON.DOWNLOAD_BUTTON')}}

      .button(
        v-ripple
        v-on:click="generateHtml"
        v-bind:class="generateButtonClasses"
      )
        .button-icon(v-html="$icons.htmlTag")
        span HTML

      .button(
        v-ripple
        v-on:click="toggleInCollection(icon)"
        v-bind:class="{'is-gray': compact, 'is-selected': isIconInCollection(icon), 'is-hide': isHide}"
      )
        .button-icon.is-bookmark(v-html="$icons.addToCollection")
        span {{ $t('ICON.COMPONENTS.ACCORDION.COLLECT') }}

    share-icon(
      v-if="!compact"
      v-bind:icon="icon"
    )

    generate-html(v-bind:icon="icon" v-bind:id="_uid" ref="generateHtml")
    download-icon-modal(v-bind:icon="icon" v-bind:name="downloadModalName")
    .added-to-collection(ref="addedToCollection" v-on:click="showRightSidebar()")
      .icon-added(v-html="$icons.save")
      .title-added  {{this.notificationTitle}}
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DownloadIcon',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    icon: {
      type: Object,
      'default': {}
    },
    isAccordion: {
      type: Boolean,
      'default': false
    },
    compact: {
      type: Boolean,
      'default': false
    },
    disabled: {
      type: Boolean,
      'default': false
    },
    locale: {
      type: String,
      'default': 'en-US'
    },
    isHide: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      isBtnShow: true,
      iconAdded: false,
      notificationTitle: 'Added to Collections'
    }
  },
  computed: {
    ...mapState({
      options: state => state.icon,
      user: state => state.auth.user,
      collection: state => state.collections.collection,
      currentCollection: state => state.collections.collection.name
    }),
    link () {
      return `ic8.link/${this.icon.id}`
    },
    generateButtonClasses () {
      return {
        'is-white': !this.compact,
        'is-gray': this.compact,
        'is-disabled': this.disabled
      }
    },
    downloadModalName () {
      return `download-icon-modal-${this._uid}`
    }
  },
  methods: {
    ...mapActions([
      'downloadIcon',
      'downloadCollection',
      'toggleIconInCollection',
      'setCollectionsMode',
      'showRightSidebar',
      'openCollection'
    ]),
    collectionNotification (icon) {
      this.$refs.addedToCollection.classList.add('is-active')
      if (this.isIconInCollection(icon)) {
        this.notificationTitle = 'Deleted from ' + this.currentCollection
      } else {
        this.notificationTitle = 'Added to ' + this.currentCollection
      }
      setTimeout(() => {
        this.$refs.addedToCollection.classList.remove('is-active')
      }, 5000)
    },
    openDownloadModal () {
      this.$modal.show(this.downloadModalName)
    },
    generateHtml () {
      if (this.disabled) {
        return
      }
      this.$analytics.track({
        event: 'Generated HTML',
        category: 'Downloads'
      })
      this.$modal.show('generate-html' + this._uid)
      this.$refs.generateHtml.generateHtml(this.options)
    },
    isIconInCollection (icon) {
      if (!icon) {
        return true
      }
      let exists = false
      if (Array.isArray(this.collection.icons)) {
        this.collection.icons.some(i => {
          if (i.iconId === icon.id && !icon.user_icon_id) {
            exists = true
            return true
          }
        })
      }
      return exists
    },
    toggleInCollection (icon) {
      this.$analytics.trackIconClick({
        id: icon.id,
        term: this.$route.params.term
      })
      this.collectionNotification(icon)
      let $el = this.$refs.addedToCollection
      console.log('$el', $el.offsetWidth)
      if ($el.offsetWidth > 580) {
        this.showRightSidebar()
        this.openCollection()
      }
      this.setCollectionsMode()
      this.toggleIconInCollection({ icon })
        .catch(error => {
          console.error(error)
          if (error && error.notify) {
            this.$error({
              title: 'Collection update failed',
              text: error.notify
            })
          }
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';
  @import '../../assets/css/mixins';

  .generate-html-icon{
    display: inline-block;
    width: 24px;
    height: 24px;
  }

  .download-icon {
    margin: 0 auto;

    .added-to-collection {
      display: block;
      width: 100%;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 4;
      background: #fff;
      cursor: pointer;
      height: 40px;
      line-height: 40px;
      box-shadow: 0px -1px 13px -2px rgba(0,0,0,0.4);
      transform: translateY(80px);
      transition: .3s all;
      text-align: center;

      &.is-active {
        transform: translateY(80px);
        @media (max-width: 580px) {
          transform: translateY(0);
        }
      }

      .title-added {
        display: inline-block;
        font-size: 18px;
      }

      .icon-added {
        width: 26px;
        height: 26px;
        display: inline-block;
        position: relative;
        top: 6px;
        left: -5px;
      }
    }

    @media (max-width: $responsive-app) {
      display: flex;
      flex-direction: column;
    }

    &.is-compact {
      display: block;
      text-align: left;
      margin-bottom: 14px;

      & > .download-selector {
        white-space: nowrap;
        margin: 7px 0 14px;
        min-width: 0;

        @media (max-width: 1000px) {
          margin: 10px 0 15px;
        }
      }
    }
  }

  .share-icon {
    min-width: 170px;
    margin-top: 4px;
    text-align: center;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    & > .button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      margin: 0 8px 0 6px;
      width: 136px;
      min-width: 0;
      border-radius: 5px;
      font-weight: 600;
      font-size: 18px;
      line-height: 44px;
      height: 48px;

      @media (max-width: 1100px) {
        width: auto;
        min-width: 125px;
      }

      @media (max-width: 340px) {
        margin-bottom: 3px;
      }

      .button-icon {
        display: inline-block;
        position: relative;
        margin-right: 5px;
        height: 24px;
        line-height: 0;

        &.is-icon-only {
          margin-right: 0;
        }

        &.is-bookmark {
          top: 0;
        }

        & > /deep/ svg {
          width: 24px;
          height: 24px;
        }
      }

      &.is-hide {
        display: none;
      }

      &.is-gray {
        width: auto;
        min-width: 125px;
        background: transparent;
        border: 2px solid #98989A;
        border-radius: 6px;
        color: #8C8C8E;
        fill: #8C8C8E;
      }

      &.is-icon-only {
        font-size: 0;
        line-height: 61px;
      }

      &.is-selected {
        background-color: rgba(254, 217, 163, .4);
        border-color: rgba(254, 217, 163, .4);
      }
    }
  }
</style>
