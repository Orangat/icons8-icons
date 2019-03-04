<template lang="pug">
  .collection(
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
      .info(v-bind:class="{'is-no-inline': collectionLength}")
        template.test(v-if="collectionLength") {{ collection.icons.length }}
        template(v-if="!collectionLength")
          div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.DRAG_ICONS_PREVIEW')")
      .wrap-icon
        app-icon.icon(
        v-for="icon in getPreviewIcons(collection.icons)"
        v-bind:key="icon.id"
        v-bind:icon="icon"
        v-bind:custom-size="32"
        )
      img(v-if="collection.default && collection.icons.length === 0" src="/vue-static/icon/collection-favorites.png")
</template>

<script>
import edit from './icons/edit.svg'
import confirm from './icons/save.svg'
import remove from './icons/remove.svg'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'AppCollection',
  props: ['collection'],

  data () {
    return {
      icons: {
        edit,
        confirm,
        remove
      },
      collectionsDragOver: {},
      newCollectionDragOver: false
    }
  },

  computed: {
    ...mapState({
      currentCollection: state => state.collections.collection
    }),

    collectionLength () {
      return this.collection.icons === undefined ? 0 : this.collection.icons.length
    }
  },

  methods: {
    ...mapActions([
      'selectCollection',
      'createCollection',
      'openCollection',
      'addUniqueInCollection',
      'addIconsToCollection'
    ]),

    getPreviewIcons (icons) {
      return Array.isArray(icons) ? icons.slice(0, 9) : []
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

  .collection {
    position: relative;
    cursor: pointer;
    margin: 0 8px;
    display: inline-block;
    vertical-align: top;
    transition: 0.2s all ease;
    img {
      width: 104px;
      position: absolute;
      top: 6px;
      right: -6px;
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
        background: rgb(255, 238, 212);
      }

      .title {
        color: #000000;
        line-height: 16px;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }

  .preview {
    position: relative;
    width: 192px;
    height: 96px;
    padding: 16px;
    background-color: #f3f3f3;
    border-radius: 6px;
    overflow: hidden;
    white-space: pre-wrap;

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

  .wrap-icon {
    margin: 16px -16px 0 -4px;
    max-height: 32px;
    overflow: hidden;
    white-space: nowrap;
  }

  .info {
    position: relative;
    line-height: 16px;
    font-size: 12px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.3);

    &.is-no-inline {
      position: absolute;
      top: 16px;
      right: 16px;
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

</style>
