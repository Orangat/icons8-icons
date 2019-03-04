<template lang="pug">
  .app-right-sidebar(v-bind:class="sidebarClasses")
    .close-collection(
      v-html="$icons.closeCollections"
      v-on:click="close"
    )

    collection-sidebar(v-show="isCollectionOpen")
    collection-list(v-show="!isCollectionOpen")
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'AppRightSidebar',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    locale: {
      type: String,
      'default': 'en-US'
    }
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      sidebar: state => state.ui.sidebars.right,
      mode: state => state.ui.mode,
      currentCollection: state => state.collections.collection,
      isCollectionOpen: state => state.collections.isCollectionOpen
    }),
    sidebarClasses () {
      return {
        'is-disabled': !this.sidebar.enabled,
        'is-active': this.sidebar.active
      }
    }
  },
  watch: {
    'user.authToken' () {
      if (this.loaded) {
        this.load()
      }
    }
  },
  mounted () {
    if (!this.loaded) {
      this.load()
    }
  },
  methods: {
    ...mapActions([
      'showRightSidebar',
      'hideRightSidebar',
      'hideLeftSidebar',
      'setIconMode',
      'loadCollections'
    ]),
    close () {
      this.hideRightSidebar()
      this.setIconMode()
    },
    load () {
      this.isLoading = true
      this.loadCollections()
        .then(() => {
          this.isLoading = false
          this.loaded = true
        })
        .catch(error => {
          console.log('error', error)
          this.loaded = true
        })
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';

  .app-right-sidebar {
    width: 100%;
    background: #fff;
    height: $collection-height;
    z-index: 25;
    top: auto;
    bottom: -$collection-height;
    box-shadow: 0 2px 0 0 #e9e9e9;
    position: absolute;
    padding: 16px 0 16px;
    border-top: 2px solid rgb(233,233,233);
    transition: 0.3s all ease-in-out;
    display: flex;
    flex-direction: column;

    @media (max-width: 580px) {
      height: 100vh;
      bottom: -100vh;
      padding-top: 28px;

      &.is-active {
        top: 0;
        bottom: 0;
      }
    }

    .close-collection {
      width: 20px;
      height: 20px;
      position: absolute;
      top: 13px;
      right: 13px;
      cursor: pointer;
      z-index: 2;
      transition: 0.3s all ease-in-out;
      @media (max-width: 480px) {
        top: 8px;
        right: 8px;
      }
      & > svg {
        width: 100%;
        height: 100%;
      }
    }

    &.is-active {
      bottom: 0;
    }

    &.is-disabled {
      display: none;
    }

    .app-right-sidebar-content {
      position: static;

      @media (max-width: $responsive-app-right-sidebars-tiny) {
        right: 0;
      }

      &.is-drag-over {
        &:after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba($color-orange, 0.2);
        }
      }
    }
  }
</style>
