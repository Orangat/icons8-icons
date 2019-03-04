<template lang="pug">
  .collection-list
    .collection-title(v-on:click="closeCollection")  {{ $t('ICON.COMPONENTS.COLLECTIONS.COLLECTIONS') }}
    .collection-counter
      template(v-if="collections.length < 2") {{collections.length}} {{ $t('ICON.COMPONENTS.COLLECTIONS.SET') }}
      template(v-else) {{collections.length}} {{ $t('ICON.COMPONENTS.COLLECTIONS.SETS') }}
    .collections-wrap
      .collections(
        v-bind:class="collectionsClasses"
      )
        .collection.is-favorites(
          v-if="defaultCollection"
          v-bind:class="{'is-active': defaultCollection === currentCollection}"
        )
          .preview(
            v-on:click="activateCollection(defaultCollection)"
            v-on:dragover="dragOver(defaultCollection, $event)"
            v-on:dragenter="dragEnter(defaultCollection, $event)"
            v-on:dragleave="dragLeave(defaultCollection, $event)"
            v-on:drop="drop(defaultCollection, $event)"
            v-bind:class="{'is-drag-over': collectionsDragOver[defaultCollection.id]}"
          )
            .title {{ $t('ICON.COMPONENTS.COLLECTIONS.FAVORITES') }}
              .favorites-icon(v-html="$icons.favoriteIcon")
            .info(v-bind:class="{'is-no-inline': defaultCollection.icons.length}")
              template(v-if="defaultCollection.icons.length") {{defaultCollection.icons.length }}
              template(v-if="!defaultCollection.icons.length")
                div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.MARK_ICONS')")
            .wrap-icon
              app-icon.icon(
                v-for="icon in getPreviewIcons(defaultCollection.icons)"
                v-bind:key="icon.id"
                v-bind:icon="icon"
                v-bind:custom-size="32"
              )
            img(v-if="!defaultCollection.icons.length" src="/vue-static/icon/collection-favorites.png")

        .collection
          .preview.is-create(
            v-on:click.stop="createCollection"
            v-on:dragover="dragOver(false, $event)"
            v-on:dragenter="dragEnter(false, $event)"
            v-on:dragleave="dragLeave(false, $event)"
            v-on:drop="drop(false, $event)"
            v-bind:class="{'is-drag-over': newCollectionDragOver}"
          )
            .preview-desception
              .title {{ $t('ICON.COMPONENTS.COLLECTIONS.CREATE_NEW') }}
              .info {{ $t('ICON.COMPONENTS.COLLECTIONS.DRAG_ICONS') }}
        transition(name="fade")
          .empty-state(v-if="collections.length === 1")
            .empty-state-title {{$t('WEB_APP.COLLECTIONS.NEW_TITLE')}}
            .empty-info-wrap
              .empty-info.clearfix
                .info-icon(v-html="$icons.colors")
                div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.DOWNLOAD_AND_EDIT')")
              .empty-info.clearfix
                .info-icon.is-custom-size(v-html="$icons.fonts")
                div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.CREATE_FONTS_SETS')")
              .empty-info.clearfix
                .info-icon(v-html="$icons.collectionsInfo")
                div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.STORE')")

        .collection(
          v-for="collection in collections"
          v-if="!collection.default"
          v-bind:class="{'is-active': collection === currentCollection}"
        )
          .preview(
            v-on:click="activateCollection(collection)"
            v-on:dragover="dragOver(collection, $event)"
            v-on:dragenter="dragEnter(collection, $event)"
            v-on:dragleave="dragLeave(collection, $event)"
            v-on:drop="drop(collection, $event)"
            v-bind:class="{'is-drag-over': collectionsDragOver[collection.id]}"
          )
            .title {{ collection.name }}
            .info(v-bind:class="{'is-no-inline': collection.icons.length}")
              template.test(v-if="collection.icons.length") {{collection.icons.length }}
              template(v-if="!collection.icons.length") {{ $t('ICON.COMPONENTS.COLLECTIONS.DRAG_ICONS') }}
            .wrap-icon
              app-icon.icon(
                v-for="icon in getPreviewIcons(collection.icons)"
                v-bind:key="icon.id"
                v-bind:icon="icon"
                v-bind:custom-size="32"
              )

            .remove(
              v-html="$icons.remove"
              v-on:click.stop="tryRemoveCollection(collection)"
            )
    app-modal(
      name="remove-collection"
      v-bind:width="292"
      v-bind:content-class="'remove-collection-modal'"
    )
      p {{$t('WEB_APP.COLLECTIONS.DELETE_COLLECTION')}}
      .button(v-on:click="confirmRemove") {{$t('WEB_APP.COLLECTIONS.DELETE_ACTION')}}
</template>

<script>
import remove from './icons/remove.svg'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'CollectionList',
  data () {
    return {
      collectionsDragOver: {},
      newCollectionDragOver: false,
      removingCollection: false,
      icons: {
        remove
      }
    }
  },
  computed: {
    ...mapState({
      collections: state => state.collections.collections,
      currentCollection: state => state.collections.collection,
      isCollectionOpen: state => state.collections.isCollectionOpen
    }),
    defaultCollection () {
      let defaultCollection
      this.collections.forEach(collection => {
        if (collection.default) {
          defaultCollection = collection
        }
      })
      return defaultCollection
    },
    collectionsClasses () {
      return {
        'is-flex': this.collections.length === 1,
        'is-overflow': !this.isCollectionOpen
      }
    }
  },
  methods: {
    ...mapActions([
      'selectCollection',
      'createCollection',
      'removeCollection',
      'openCollection',
      'addUniqueInCollection',
      'addIconsToCollection',
      'hideRightSidebar',
      'setIconMode'
    ]),
    closeCollection () {
      this.hideRightSidebar()
      this.setIconMode()
    },
    getPreviewIcons (icons) {
      return Array.isArray(icons) ? icons.slice(0, 9) : []
    },
    tryRemoveCollection (collection) {
      this.removingCollection = collection
      this.$modal.show('remove-collection')
    },
    confirmRemove () {
      this.removeCollection(this.removingCollection)
      this.removingCollection = false
      this.$modal.hide('remove-collection')
    },
    activateCollection (collection) {
      this.selectCollection(collection).then(() => {
        this.$forceUpdate()
      })
      this.openCollection()
    },
    dragOver (collection, e) {
      e.stopPropagation()
      e.preventDefault()
      if (collection) {
        this.collectionsDragOver[collection.id] = true
      } else {
        this.newCollectionDragOver = true
      }
      this.$forceUpdate()
      e.dataTransfer.dropEffect = 'copy'
    },
    dragEnter (collection, e) {
      e.stopPropagation()
      e.preventDefault()
      if (collection) {
        this.collectionsDragOver[collection.id] = true
      } else {
        this.newCollectionDragOver = true
      }
    },
    dragLeave (collection, e) {
      e.stopPropagation()
      e.preventDefault()
      if (collection) {
        this.collectionsDragOver[collection.id] = false
      } else {
        this.newCollectionDragOver = false
      }
    },
    drop (collection, e) {
      e.stopPropagation()
      e.preventDefault()
      const data = e.dataTransfer.getData('text')
      const files = e.dataTransfer.files
      this.selectCollection(collection)
      if (collection) {
        this.collectionsDragOver[collection.id] = false
        this.addIcons(collection, data, files)
      } else {
        this.newCollectionDragOver = false
        this.createCollection()
          .then(() => {
            this.addIcons(undefined, data, files)
          })
          .catch(console.error)
      }
      return false
    },
    addIcons (collection, data, files) {
      if (data) {
        try {
          data = JSON.parse(data)
          const icon = data.icon
          if (icon) {
            this.addUniqueInCollection({ icon, collection })
            this.$analytics.trackIconClick({
              id: icon.id,
              term: this.$route.params.term
            })
          }
        } catch (e) {
          console.log('DnD data error', e)
        }
      } else if (files.length) {
        this.uploadIcons(Array.from(files))
          .then(icons => {
            return this.addIconsToCollection({ icons, collection })
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
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  .collection-list {
    transition: opacity 0.4s ease;
    position: relative;
    padding: 0 16px 2px;
    overflow-y: hidden;

    .collection-counter {
      position: absolute;
      left: 152px;
      top: -1px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(0,0,0,0.5);

      @media (max-width: 580px) {
        top: 7px;
        left: 182px;
        font-size: 14px;
      }
    }

    .collection-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: bold;
      line-height: 16px;
      margin-bottom: 8px;
      cursor: pointer;
      width: 110px;

      @media (max-width: 580px) {
        margin: 10px 0 30px;
        font-size: 18px;
      }
    }

    .empty-state {
      display: inline-block;
    }

    .collections {
      white-space: nowrap;
      position: relative;
      top: -1px;

      @media (max-width: 580px) {
        padding-right: 16px;
        white-space: normal;
      }

      &.is-flex {
        display: flex;
        align-items: center;

        @media (max-width: 580px) {
          display: block;
        }
      }
    }

    .empty-state {
      padding-left: 32px;

      @media (max-width: 580px) {
        padding-left: 0;
      }
    }

    .empty-state-title {
      font-size: 16px;
      font-weight: 700;
      color: rgba(0, 0, 0, .3);
      line-height: 20px;
      margin-bottom: 7px;
    }

    .empty-info-wrap {
      display: flex;
    }

    .empty-info {
      float: left;
      font-size: 12px;
      font-weight: 700;
      margin-right: 60px;
      line-height: 16px;
      color: rgba(0,0,0,0.3);

      &:last-child {
        margin-right: 0;
      }
    }

    .info-icon {
      width: 24px;
      height: 24px;
      margin-bottom: 13px;

      &.is-custom-size {
        width: 32px;
      }
    }

    .collection {
      position: relative;
      cursor: pointer;
      margin: 0 8px;
      display: inline-block;
      vertical-align: top;
      transition: 0.2s all ease;
      height: 96px;

      @media (max-width: 580px) {
        display: block;
        width: 100%;
        margin: 0 0 20px 0;
      }

      &:first-child {
        margin-left: 0;
      }

      &:hover {
        .preview {
          background-color: #ececec;
          transition: 0.2s all ease;
        }
        .remove {
          display: block;
        }
      }

      &.is-active {
        .preview {
          background: rgba(254,217,163, 0.4);
        }

        .title {
          color: #000000;
        }
      }

      &.is-favorites {
        width: 272px;
        min-width: 272px;
        height: 96px;

        @media (max-width: 580px) {
          width: 100%;
        }

        .preview {
          width: 100%;
          padding: 16px;
          white-space: nowrap;

          &>img {
            width: 104px;
            position: absolute;
            top: 6px;
            right: 2px;
          }
        }

        .title {
          position: relative;
          top: -1px;
          color: #000000;
        }
      }
    }

    .preview {
      position: relative;
      width: 192px;
      height: 100%;
      padding: 16px;
      background-color: #f3f3f3;
      border-radius: 6px;
      white-space: pre-wrap;

      @media (max-width: 580px) {
        width: 100%;
      }

      &.is-create {
        &:before {
          content: '';
          position: absolute;
          top: 31.5px;
          left: 16px;
          height: 1px;
          width: 32px;
          border-bottom: 2px solid #d2d2d2;
        }
        &:after {
          content: '';
          position: absolute;
          top: 16px;
          left: 31.5px;
          height: 32px;
          width: 1px;
          border-right: 2px solid #d2d2d2;
        }
      }
      &.is-drag-over {
        background-color: rgba($color-orange, 0.2);
      }
    }

    .preview-desception {
      padding-left: 48px;
    }

    .wrap-icon {
      margin: 16px -16px 0 -4px;
      max-height: 32px;
      overflow: hidden;
      white-space: nowrap;
    }

    .title {
      position: relative;
      line-height: 16px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(0,0,0,0.7);
    }

    .info {
      position: relative;
      line-height: 16px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(0,0,0,0.3);

      &.is-no-inline {
        position: absolute;
        top: 16px;
        right: 16px;
      }
    }

    .remove {
      display: none;
      position: absolute;
      top: -9px;
      right: -12px;
      width: 20px;
      height: 20px;

      & > /deep/ svg {
        width: 12px;
        height: 14px;
      }
    }

    .icon {
      width: 32px;
      height: 32px;
      margin: 0 4px;
      vertical-align: top;
      display: inline-block;

      &:nth-child(n+10) {
        display: none;
      }

      & > /deep/ svg,
      & > /deep/ img {
        width: 100%;
        height: 100%;
      }
    }

    .favorites-icon {
      display: inline-block;
      position: relative;
      top: 3px;
      width: 14px;
      height: 14px;
      margin-left: 4px;
      & > /deep/ svg {
        width: 100%;
        height: 100%;
      }
    }

    & /deep/ .remove-collection-modal {
      height: 178px;
      left: 50%;
      transform: none;
      margin-left: -148px;
      top: 55%;
    }
  }
  .fade-enter-active {
    transition: opacity .5s;
  }
  .fade-enter {
    opacity: 0;
  }
</style>
