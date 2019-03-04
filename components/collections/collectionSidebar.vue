<template lang="pug">
  .collection-sidebar(v-bind:class="{'is-loading': isLoading}")
    .app-right-sidebar-content(
      v-on:dragover="dragOver"
      v-on:dragenter="dragEnter"
      v-on:dragleave="dragLeave"
      v-on:drop="drop"
      v-bind:class="{'is-drag-over': isDragOver}"
    )
      .go-back(v-if="isCollectionOpen" v-on:click="closeCollection")
        .go-back-icon(v-html="$icons.back")
      collection-workspace
      collection-toolbar
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'CollectionSidebar',
  data () {
    return {
      isLoading: false,
      isDragOver: false,
      loaded: false
    }
  },
  computed: {
    ...mapState({
      isCollectionOpen: state => state.collections.isCollectionOpen
    })
  },
  methods: {
    ...mapActions([
      'addUniqueInCollection',
      'addIconsToCollection',
      'uploadIcons',
      'closeCollection'
    ]),
    dragOver (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDragOver = true
      this.$forceUpdate()
      e.dataTransfer.dropEffect = 'copy'
    },
    dragEnter (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDragOver = true
    },
    dragLeave (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDragOver = false
    },
    drop (e) {
      e.stopPropagation()
      e.preventDefault()
      this.isDragOver = false

      let data = e.dataTransfer.getData('text')
      if (data) {
        try {
          data = JSON.parse(data)
          const icon = data.icon
          if (icon) {
            this.addUniqueInCollection({ icon })
            this.$analytics.trackIconClick({
              id: icon.id,
              term: this.$route.params.term
            })
          }
        } catch (e) {
          console.log('DnD data error', e)
        }
      }

      if (e.dataTransfer.files.length) {
        this.uploadIcons(Array.from(e.dataTransfer.files))
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
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/mixins';

  .collection-sidebar {
    @media (max-width: 580px) {
      overflow-y: auto;
      overflow-x: hidden;
    }

    .go-back {
      position: absolute;
      top: 20px;
      left: 10px;
      cursor: pointer;
      width: 25px;
      height: 25px;
      z-index: 10;

      @media (max-width: 580px) {
        top: 32px;
      }
    }

    .go-back-icon {
      display: inline-block;
      position: relative;
      top: 0px;
      width: 24px;
      height: 24px;
      margin-right: 4px;
      & > /deep/ svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    }

    &.is-loading {
      @include loading;

      .collection-toolbar,
      .collection-workspace,
      .collection-list {
        opacity: 0;
      }
    }
  }
</style>
