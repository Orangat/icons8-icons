<template lang="pug">
  .collection-workspace
    template(v-if="collection.icons && collection.icons.length")
      icon-recolor
      span.icons-counter
        span(v-if="collection.recentlyDownloaded" v-html="$t('ICON.COMPONENTS.COLLECTIONS.AUTOCOLLECTION')")
        template {{collection.icons.length }} {{ $t('ICON.COMPONENTS.COLLECTIONS.ICON_INFO') }} <span v-bind:class="{'is-limit': collection.icons.length >= iconsLimit}"> {{ iconsLimit }}</span> {{ $t('ICON.COMPONENTS.COLLECTIONS.ICONS') }}
      download-collection
      .icons-container
        .icons
          label.icon.is-new
            .plus-icon(v-html="$icons.plus")
            input.upload-input(type="file" multiple v-on:change="handleUpload")
          .icon(
            v-for="icon in icons"
            v-bind:key="icon.id"
            v-bind:class="{'is-unavailable': !isIconsAvailable({icon})}"
          )
            app-icon(
              v-bind:style="iconStyles"
              v-bind:icon="icon"
            )
            .paid(v-html="$icons.dollar" v-if="!isIconsAvailable({icon})")
            .remove(v-html="$icons.remove" v-on:click="tryRemoveIcon(icon)")

    template(v-if="!collection.icons || !collection.icons.length")
      span.icons-counter {{ $t('ICON.COMPONENTS.COLLECTIONS.EMPTY_STATE_ICON') }}
      .welcome-wrap
        .welcome
          label.upload
            .icon.is-new.is-big
              .plus-icon(v-html="$icons.plus")
            .drag-upload-text(v-html="$t('WEB_APP.COLLECTIONS.DRAG_DROP_ICONS_OR')")
            input.upload-input(type="file" multiple v-on:change="handleUpload")
        img.welcome-image(src="/vue-static/icon/collection-new.png")

    app-modal(
      name="remove-icon-from-collection"
      v-bind:width="292"
      v-bind:content-class="'remove-icon-from-collection-modal'"
    )
      p {{$t('WEB_APP.COLLECTIONS.REMOVE_ICONS')}}
      .button(v-on:click="confirmRemove") {{$t('WEB_APP.COLLECTIONS.DELETE_ACTION')}}
      | &nbsp;&nbsp;&nbsp;&nbsp;
      a(v-on:click="cancelRemove") {{$t('WEB_APP.COLLECTIONS.CANCEL_ACTION')}}
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'CollectionWorkspace',
  data () {
    return {
      removingIcon: false
    }
  },
  computed: {
    ...mapGetters(['isIconsAvailable']),
    ...mapState({
      collection: state => state.collections.collection
    }),
    iconStyles () {
      return {
        fill: `#${this.$store.state.icon.color}`
      }
    },
    icons () {
      return this.collection.recentlyDownloaded
        ? this.collection.icons.slice().reverse()
        : this.collection.icons
    },
    iconsLimit () {
      return this.collection.recentlyDownloaded ? 100 : 1000
    }
  },
  methods: {
    ...mapActions([
      'removeIconFromCollection',
      'uploadIcons',
      'addIconsToCollection'
    ]),
    tryRemoveIcon (icon) {
      this.removingIcon = icon
      this.$modal.show('remove-icon-from-collection')
    },
    confirmRemove () {
      this.removeIconFromCollection({ icon: this.removingIcon })
      this.removingCollection = false
      this.$modal.hide('remove-icon-from-collection')
    },
    cancelRemove () {
      this.$modal.hide('remove-icon-from-collection')
    },
    handleUpload (e) {
      if (!e.target.files.length) {
        return
      }
      this.uploadIcons(Array.from(e.target.files))
        .then(icons => {
          return this.addIconsToCollection({ icons })
        })
        .catch(error => {
          console.log('error', error)
          if (error && error.notify) {
            this.$error({
              title: 'Collection update failed',
              text: error.notify
            })
          }
        })
      this.$analytics.track({
        event: 'Uploaded own SVG',
        category: 'Downloads'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';

  .collection-workspace {
    transition: opacity 0.4s ease;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;

    @media (max-width: 580px) {
      flex-direction: column;
    }

    .icons-container {
      max-height: 100%;
      padding: 0 4px 0 18px;
      flex: 1 1 25%;
      position: relative;
      overflow-x: hidden;
      overflow-y: scroll;

      @media (max-width: 580px) {
        margin-top: 65px;
        padding: 0 16px 0 0;
        overflow: hidden;
      }
    }

    .icons-counter {
      font-size: 12px;
      font-weight: 400;
      color: rgba(0,0,0,0.5);
      position: absolute;
      top: 40px;
      left: 39px;
      z-index: 1;
      @media (max-width: 400px) {
        left: 16px;
      }

      .is-limit {
        color: $color-red;
      }
    }

    .icons {
      width: 100%;
      max-height: 132px;
      padding: 5px 25px 0 0;
      @media (max-width: 580px) {
        padding-right: 0;
        max-height: none;
        display: flex;
        flex-wrap: wrap;
      }
    }

    .plus-icon {
      width: 24px;
      height: 24px;
      position: absolute;
      left: 50%;
      margin-left: -12px;
      top: 50%;
      margin-top: -12px;
    }

    .icon {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 48px;
      border-radius: 4px;
      margin: 4px 8px;
      vertical-align: top;
      transition: background 0.2s ease;

      @media (max-width: 580px) {
        margin: 4px 6px;
      }

      &:hover {
        background: #f6f6f6;
        .remove {
          opacity: 1;
          cursor: pointer;
        }
      }

      &.is-unavailable {
        &>.app-icon {
          opacity: 0.35;
        }
      }

      &>.app-icon {
        width: 100%;
        height: 100%;

        & > /deep/ img {
          width: 80%!important;
          height: 80%!important;
        }
      }

      &.is-new {
        position: relative;
        background: #F6F6F6;
        cursor: pointer;

        &.is-big {
          width: 48px;
          height: 48px;
          background: #F6F6F6;
        }
      }
    }

    .paid {
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      transition: all 0.2s ease;
    }

    .remove {
      opacity: 0;
      position: absolute;
      top: -9px;
      right: -14px;
      width: 20px;
      height: 20px;
      transition: opacity 0.4s ease;

      & > /deep/ svg {
        width: 14px;
        height: 14px;
      }
    }

    .welcome-title {
      font-size: 18px;
      padding: 0.5rem 0 1rem;
    }

    .welcome-wrap {
      position: relative;
      margin-left: $left-sidebar-width;
      width: 100%;
      background: #fff;
      padding: 0 0 0 18px;
      z-index: 1;

      @media (max-width: 580px) {
        padding: 0;
        margin: 70px 0 0 0;
        display: flex;
        flex-direction: column;
      }

      &:before {
        content: '';
        width: 30px;
        height: 30px;
        background: #fff;
        position: absolute;
        left: -36px;
        top: 71px;
      }

      &:after {
        content: '';
        width: 1px;
        height: 120px;
        position: absolute;
        left: 0;
        top: 0;
        background: rgba(0, 0, 0, .1);

        @media (max-width: 580px) {
          display: none;
        }
      }
    }

    .welcome {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .welcome-image {
      width: 220px;
      position: absolute;
      bottom: -123px;
      left: 240px;

      @media (max-width: 580px) {
        position: static;
        margin: 30px auto 0;
        width: 250px;
      }
    }

    .upload {
      width: 215px;
      line-height: 16px;
      font-size: 14px;
      font-weight: 700;

      @media (max-width: 580px) {
        margin: 0 auto;
      }

      .icon {
        margin-right: 15px;
      }

      .icon.is-new {
        float: left;
      }
    }

    .upload-wrap {
      float: left;
    }

    .drag-upload-text {
      margin-top: 12px;
      color: rgba(0,0,0,0.3);
      font-size: 12px;
      font-weight: 400;
    }

    .upload-drag-text {
      display: inline-block;
    }

    .download-collection {
      position: relative;
      background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,1) 100%);
      flex: 0 0 224px;

      @media (max-width: 580px) {
        flex: none;
        background: #fff;
        position: absolute;
        top: 19px;
        width: 100%;
        z-index: 1;
        margin-bottom: 15px;
      }

      .app-popup .app-popup-content {
        width: 280px;
      }
    }

    & /deep/ .remove-icon-from-collection-modal {
      top: auto;
      bottom: 153px;
      left: 50%;
      margin-left: -148px;
      transform: none;
    }

    .upload-input {
      display: none;
    }

    .icon-recolor {
      position: absolute;
      top: 89px;
      left: 180px;
      z-index: 10;

      & /deep/ .color-picker {
        .app-popup-content {
          top: -165px;
        }
        .color-picker-toggle {
          width: 24px;
          height: 24px;
        }
      }
    }
  }
</style>
