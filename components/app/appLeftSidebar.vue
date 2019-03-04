<template lang="pug">
  .app-left-sidebar(
    v-bind:class="sidebarClasses"
  )
    .app-left-sidebar-content(
      v-app-scroll
      data-simplebar
      v-touch:swipe.left="hideLeftSidebar"
      v-bind:class="{'is-custom-padding': isCollectionsMode}"
    )
      .app-profile-wrap
        app-menu-auth(:light-mode="true")
          .menu-auth-icon(slot="login" v-html="$icons.guestIcon")
          .menu-auth-icon(slot="user" v-html="userIcon")
        app-menu-language(:light-mode="true")
      .app-expand-wrap
        app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE')" v-bind:is-open="true")
          platform-filter.app-left-sidebar-platforms
        bundle-filter.app-left-sidebar-bundles
        app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.CATEGORIES')" ref="packs")
          pack-filter.app-left-sidebar-packs
        app-expand(v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.TRENDS')")
          seo-pack-filter.app-left-sidebar-packs

      a.old-app(href="https://old.icons8.com/icon/pack/free-icons/all") {{ $t('ICON.COMPONENTS.LEFT_SIDEBAR.OLD_INTERFACE') }}

      .actions(
      v-if="collections")
        .collections(
        v-bind:class="{'is-active': isCollectionsMode}")
          .header
            span.collections-title
              | {{ $t('ICON.COMPONENTS.LEFT_SIDEBAR.COLLECTIONS') }}
            span.view-all(v-on:click.stop="showAllCollections")
              | {{ $t('ICON.COMPONENTS.LEFT_SIDEBAR.VIEW_ALL') }}
          .recent-collection(
          v-on:click.stop="showCollection")
            app-collection(v-bind:collection="currentCollection")
</template>

<script>
import packFilter from '~/components/app/packFilter.vue'
import bundleFilter from '~/components/app/bundleFilter.vue'
import seoPackFilter from '~/components/app/seoPackFilter.vue'
import platformFilter from '~/components/app/platformFilter.vue'
import attributesFilter from '~/components/app/attributesFilter.vue'

import { mapState, mapActions } from 'vuex'

export default {
  name: 'AppLeftSidebar',
  serverCacheKey: props => JSON.stringify(props),
  components: {
    packFilter,
    bundleFilter,
    seoPackFilter,
    platformFilter,
    attributesFilter
  },
  props: {
    locale: {
      type: String,
      'default': 'en-US'
    },
    collections: {
      type: Boolean,
      'default': true
    }
  },
  computed: {
    ...mapState({
      mode: state => state.ui.mode,
      sidebar: state => state.ui.sidebars.left,
      currentCollection: state => state.collections.collection,
      isCollectionOpen: state => state.collections.isCollectionOpen,
      effectsState: state => state.ui.effects.active,
      pack: state => state.pack
    }),
    isCollectionsMode () {
      return this.mode === this.$store.state.ui.modes.COLLECTIONS_MODE
    },
    sidebarClasses () {
      return {
        'is-disabled': !this.sidebar.enabled,
        'is-active': this.sidebar.active && !this.effectsState
      }
    },
    userIcon () {
      return this.activeLicense ? this.$icons.allAccess : this.$icons.rasterUserIcon
    }
  },
  watch: {
    pack () {
      if (this.pack.code) {
        this.$refs.packs.open()
      }
    }
  },
  mounted () {
    if (this.pack.code) {
      this.$refs.packs.open()
    }
  },
  methods: {
    ...mapActions([
      'showLeftSidebar',
      'hideLeftSidebar',
      'showRightSidebar',
      'hideRightSidebar',
      'setIconMode',
      'setCollectionsMode',
      'closeCollection'
    ]),
    showCollection () {
      this.showRightSidebar()
      this.setCollectionsMode()
    },
    showAllCollections () {
      this.closeCollection()
      this.showRightSidebar()
      this.setCollectionsMode()
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';

  .app-left-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: $left-sidebar-width;
    will-change: transform;
    transition: 0.3s all ease-in-out;
    background: $left-sidebar-color;

    @media (max-width: $responsive-app-left-sidebars) {
      left: -$left-sidebar-width;
      z-index: 20;
      &.is-active {
        transform: translateX($left-sidebar-width);
      }
    }

    .app-left-sidebar-content {
      overflow-y: auto;
      height: 100%;
      padding-bottom: 180px;
      padding-top: 15px;
      position: relative;
    }

    .app-profile-wrap {
      display: none;
      padding-left: 20px;
      padding-right: 8px;
      @media (max-width: 830px) {
        display: flex;
        align-items: center;
        height: 50px;
        .app-popup .app-popup-content {
          left: 0;
          right: auto;
          min-width: 140px;
        }
        .app-menu-auth {
          margin-left: 0;
        }
        .menu-auth-icon {
          width: 30px;
          height: 30px;
        }
      }
    }

    .app-expand-wrap {
      overflow-x: hidden;
      overflow-y: hidden;
    }

    .separator {
      width: 190px;
      margin: 0 auto;
      height: 1px;
      background: #7483A7;
      opacity: 0.5;
    }

    .old-app {
      position: absolute;
      bottom: 152px;
      width: 224px;
      color: #ccc;
      padding: 0 24px 10px;
      padding: 5px 24px;
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      background: #363250;

      &:hover {
        text-decoration: underline;
      }
    }

    .actions {
      width: 224px;
      min-height: 65px;
      height: 152px;
      font-weight: 600;
      position: absolute;
      bottom: 0;
      background: #27233F;
      transition: 0.3s all ease-in-out;

      &.is-active {
        bottom: $collection-height;
      }
    }

    .collections {
      display: block;
      font-size: 16px;
      color: #fff;
      transition: all .2s;
      padding: 8px;
      padding-top: 10px;

      .header {
        margin-bottom: 6px;
        margin-left: 16px;
      }

      .collections-title {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-weight: bold;
      }

      .view-all {
        font-size: 12px;
        color: rgba(180, 213, 255, 0.5);
        cursor: pointer;
        margin-left: 25px;
        font-weight: 400;
      }

    }

    .collection-icon {
      position: relative;
      top: 5px;
      display: inline-block;
      width: 20px;
      height: 20px;
      margin-right: 10px;
      line-height: 32px;

      svg {
        fill: #fff;
      }
    }

    &.is-disabled {
      display: none;
    }
  }
</style>
