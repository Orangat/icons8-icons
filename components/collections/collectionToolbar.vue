<template lang="pug">
  .collection-toolbar
    form(v-on:submit.prevent="updateName")
      span(v-on:dblclick.stop="editName")
        input.title(
          ref="input"
          v-bind:value="name"
          v-bind:disabled="!collection.edit"
        )
      .action-ellipsis(v-on:click="openActionPopup")
        .wrap-dots(v-html="$icons.dots")
      app-popup.action-popup(
        ref="actionPopup"
        v-bind:show-toggle="false"
        v-bind:position="'bottom-center'"
      )
        div(slot="content")
          .action-list-wrap
            .action-list-item(v-on:click.stop="editName") {{ $t('ICON.COMPONENTS.COLLECTIONS.EDIT_TITLE') }}
              .action(
                v-html="$icons.edit"
              )
            .action-list-item
              app-popup.share-popup(
              v-bind:show-toggle="false"
              v-bind:position="'bottom-center'"
              v-on:open="sharePopupShown"
              )
                .share-popup-button(
                v-html="$icons.shareNew"
                )
                div {{ $t('ICON.COMPONENTS.COLLECTIONS.SHARE_COLLECTIONS') }}
                div(slot="content")
                  div(v-html="$t('ICON.COMPONENTS.COLLECTIONS.SHARE_COLLECTIONS')")
                  .button.is-tiny(
                  v-if="!collection.share"
                  v-on:click="share"
                  v-bind:class="{'is-loading': isSharing}"
                  v-html="$t('ICON.COMPONENTS.COLLECTIONS.CREATE_PUBLIC_LINK')"
                  )
                  input.share-url(
                  v-on:click="copyShareUrl"
                  v-if="collection.share"
                  v-bind:value="collection.share"
                  )
            .action-list-item(
              v-on:click.stop="tryRemoveCollection"
              v-bind:class="{'is-disabled': collection.default}"
            ) {{ $t('ICON.COMPONENTS.COLLECTIONS.DELETE') }}
              .action(
                v-html="$icons.del"
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
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'CollectionToolbar',
  data () {
    return {
      isSharing: false
    }
  },
  computed: {
    ...mapState({
      collection: state => state.collections.collection,
      user: state => state.auth.user
    }),
    name () {
      return this.collection.name
    }
  },
  beforeDestroy () {
    document.documentElement.removeEventListener('click', this.outsideClick, false)
  },
  methods: {
    openActionPopup () {
      setTimeout(() => {
        this.$refs.actionPopup.openPopup()
      }, 0)
    },
    ...mapMutations({
      editCollection: 'COLLECTION_EDITING'
    }),
    ...mapActions([
      'renameCollection',
      'shareCollection',
      'removeCollection',
      'closeCollection'
    ]),
    editName () {
      this.$refs.actionPopup.closePopup()
      this.startEditing()
    },
    updateName () {
      this.stopEditing()
      this.renameCollection(this.$refs.input.value)
    },
    outsideClick (e) {
      if (!this.$el.contains(e.target)) {
        this.updateName()
      }
    },
    startEditing () {
      document.documentElement.addEventListener('click', this.outsideClick, false)
      this.editCollection(true)
      this.$forceUpdate()
      setTimeout(() => {
        this.$refs.input.select()
        this.$refs.input.focus()
      })
    },
    stopEditing () {
      document.documentElement.removeEventListener('click', this.outsideClick, false)
      this.editCollection(false)
      this.$forceUpdate()
    },
    tryRemoveCollection () {
      this.$modal.show('remove-collection')
    },
    confirmRemove () {
      this.closeCollection()
      this.removeCollection(this.collection)
      this.$modal.hide('remove-collection')
    },
    share () {
      this.$ensureLogin()
        .then(() => {
          this.isSharing = true
          this.shareCollection(this.collection)
            .then(() => {
              this.collection.share = true
              this.$analytics.track({ event: 'Collection was Shared' })
              this.isSharing = false
            })
            .catch(error => {
              this.isSharing = false
              console.log('error', error)
            })
        })
        .catch(error => {
          console.log('error', error)
        })
    },
    sharePopupShown () {
      this.$analytics.track({ event: 'Open Collection Sharing Dialog' })
    },
    copyShareUrl () {
      const input = this.$el.querySelector('.share-url')
      if (input) {
        input.select()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/mixins';

  .collection-toolbar {
    position: absolute;
    transition: opacity 0.4s ease;
    top: 20px;
    left: 39px;
    @media (max-width: 580px) {
      z-index: 2;
      padding-top: 12px;
    }

    .share-popup-button {
      width: 24px;
      height: 24px;
      position: absolute;
      top: auto;
      left: 8px;
      cursor: pointer;

      @media (max-width: 580px) {
        display: none;
      }
      & > /deep/ svg {
        width: 100%;
        height: 100%;
      }
    }

    .title {
      padding: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      color: #000;
      background: none;
      border: none;
      height: auto;
      width: 120px;
    }

    .action-ellipsis {
      display: inline-block;
      width: 20px;
      position: relative;
      top: -4px;
      cursor: pointer;
      z-index: 1;
      margin-left: 17px;
    }

    .wrap-dots {
      width: 24px;
      height: 24px;
      position: absolute;
      top: -14px;
      right: -9px;
    }

    .action-list-wrap {
      padding: 12px 0;
    }

    .action-list-item {
      width: 100%;
      padding: 4px 0 4px 40px;
      position: relative;
      font-size: 16px;
      font-weight: 500;
      transition: all .2s;
      cursor: pointer;
      color: #4C4C4C;

      &.is-disabled {
        pointer-events: none;
        color: #b7b7b7;
      }

      &:hover {
        background: #F3F3F3;
      }

      .action {
        display: block;
        position: absolute;
        top: 4px;
        left: 10px;

        &:hover {
          background: transparent;
        }

        & > /deep/ svg {
          width: 16px;
          height: 16px;
        }
      }

      & > /deep/ .app-popup {
        position: static;

        /deep/ .app-popup-toggle {
          position: static;
        }
      }
    }

    .action {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      cursor: pointer;
      transition: 0.3s all ease;
      display: inline-block;
      position: relative;

      &:hover {
        background: #f4f4f4;
      }

      &.is-wide {
        width: 40px;
        & > /deep/ svg {
          width: 24px;
        }
      }

      & > /deep/ svg {
        width: 24px;
        height: 24px;
        margin: 4px;
        fill: #9b9b9b;
      }
    }

    .action-edit {
      float: right;
    }

    & /deep/ .app-popup-content {
      width: 260px;
    }

    .action-popup /deep/ .app-popup-content {
      width: 200px;
      overflow: visible;
      z-index: 10;
      top: -90px;
      left: 140%;
    }

    .share-popup /deep/ .app-popup-content {
      width: 260px;
      height: auto;
      padding: 16px;
      font-weight: 400;
      left: 50%;
    }

    .share-popup /deep/ .app-popup-toggle {
      position: static;
    }

    .button {
      margin-top: 1rem;
    }

    .share-url {
      width: 100%;
      margin-top: 1rem;
    }
  }
</style>
