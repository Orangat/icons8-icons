<template lang="pug">
  .app-icons-menu
    .app-menu-toggle.nav-icon(@click="toggleMenu" :class="{'open': leftSidebar}")
      span
      span
      span
    .logo-wrap
      app-icon-logo.app-menu-logo(:link="hostUrl" )
      nuxt-link.app-menu-item.is-logo(:to="'/icons'") {{ logoText }}
    .app-search-top(v-bind:class="{'has-mobile-show': mobileSearchActive}")
      app-search(
        :grid-selector="true"
        :locale="locale"
      )
    .app-menu-profile
      app-menu-auth(:light-mode="true")
        .menu-auth-icon(slot="login" v-html="$icons.guestIcon")
        .menu-auth-icon(slot="user" v-html="userIcon")
      app-menu-language(:light-mode="true")
    button.search-mobile-trigger(
      v-on:click.prevent="mobileSearchToggle"
    )
      span.search-mobile-show(v-if="!mobileSearchActive" v-html="$icons.search")
      span.search-mobile-hide(v-else v-html="$icons.cancel")

</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'AppIconsMenu',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    locale: {
      type: String,
      'default': 'en-US'
    }
  },
  data () {
    return {
      logoText: 'Icons',
      show: false,
      isMenu: false,
      mobileSearchActive: false
    }
  },
  computed: {
    ...mapGetters(['hostUrl']),
    ...mapState({
      leftSidebar: state => state.ui.sidebars.left.active,
      activeLicense: state => state.auth.user.activeLicense,
      selectPlatformChanged: state => state.ui.selectPlatformChanged
    }),
    userIcon () {
      return this.activeLicense ? this.$icons.allAccess : this.$icons.rasterUserIcon
    }
  },
  watch: {
    selectPlatformChanged (state) {
      if (state) {
        this.mobileSearchActive = true
        this.resetSelectPlatform()
      }
    }
  },
  created () {
    if (!this.$t) {
      this.$t = function (term, fallback) {
        return fallback
      }
    }
  },
  methods: {
    ...mapActions([
      'showLeftSidebar',
      'hideLeftSidebar',
      'showMobileSearch',
      'hideMobileSearch',
      'resetSelectPlatform'
    ]),
    toggleMenu () {
      this.isMenu = !this.isMenu
      if (this.isMenu) {
        this.showLeftSidebar()
      } else {
        this.hideLeftSidebar()
      }
    },
    mobileSearchToggle () {
      this.mobileSearchActive = !this.mobileSearchActive
      if (this.mobileSearchActive) {
        this.showMobileSearch()
      } else {
        this.hideMobileSearch()
      }
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';
  @import '../../assets/css/breakpoints';

  .app-icons-menu {
    position: relative;
    z-index: 25;
    height: $menu-height;
    padding: 0 1rem;
    font-size: 1.125rem;

    color: white;
    background: #70d467;
    background: linear-gradient(to right, #70d467 0%, #6fbbfa 100%);

    @media (max-width: $responsive-menu-medium) {
      padding: 0 1rem;
    }

    @media (max-width: 75rem) {
      padding: 0 1rem;
    }

    .app-menu-toggle {
      display: none;
      cursor: pointer;
      @media (max-width: $responsive-menu-short) {
        display: inline-block;
        width: 26px;
        position: absolute;
        top: 17px;
        left: 1rem;

        & > svg {
          fill: currentColor;
        }
      }
    }

    .nav-icon {
      width: 26px;
      height: 26px;
      position: absolute;
      transform: rotate(0deg);
      transition: .5s ease-in-out;
      cursor: pointer;
    }

    .nav-icon span {
      display: block;
      position: absolute;
      height: 3px;
      width: 100%;
      background: #fff;
      border-radius: 2px;
      opacity: 1;
      left: 0;
      transform: rotate(0deg);
      transition: .25s ease-in-out;
    }

    .nav-icon span:nth-child(1) {
      top: 0;
      transform-origin: left center;
    }

    .nav-icon span:nth-child(2) {
      top: 9px;
      transform-origin: left center;
    }

    .nav-icon span:nth-child(3) {
      top: 18px;
      transform-origin: left center;
    }

    .nav-icon.open span:nth-child(1) {
      transform: rotate(45deg);
      top: 0;
      left: 0 ;
    }

    .nav-icon.open span:nth-child(2) {
      width: 0;
      opacity: 0;
    }

    .nav-icon.open span:nth-child(3) {
      transform: rotate(-45deg);
      top: 19px;
      left: 0;
    }

    .app-menu-logo {
      display: flex;
      margin-top: 14px;
      float: left;
      color: inherit;
      margin-left: 9px;
      opacity: 0.75;
      transition: 0.3s all ease;
      .rectangle {
        transition: 0.8s all ease;
      }

      &:hover {
        opacity: 1;
        .rectangle {
          border-radius: 30px;
        }
      }
    }

    .logo-wrap {
      width: $left-sidebar-width - 16px;
      float: left;
      @media (max-width: $responsive-app-left-sidebars) {
        width: 20%;
      }
      @media (max-width: 800px) {
        width: auto;
        float: none;
        position: absolute;
        margin-left: -15px;
        left: 50%;
      }
    }

    .search-mobile-trigger {
      position: absolute;
      right: 10px;
      top: 15px;
      display: none;
      width: 26px;
      height: 26px;
      padding: 0;
      border: 0;
      color: #fff;
      background-color: transparent;
      outline: 0;
      cursor: pointer;
      @media(max-width: 830px) {
        display: inline-block;
      }
      svg {
        fill: currentColor;
      }
    }

    .app-search-top {
      display: block;
      @media (max-width: 830px) {
        display: none;
        position: absolute;
        top: 7px;
        left: 10px;
        right: 40px;
        z-index: 10;
        &.has-mobile-show {
          display: block;
        }
      }
    }

    .app-menu-item {
      display: inline-block;
      color: inherit;
      vertical-align: top;
      height: $menu-height;
      line-height: $menu-height;
      text-decoration: none;
      transition: all 0.4s ease;
      cursor: pointer;
      font-weight: 400;

      .app-popup-arrow {
        display: none;
      }
      @media (max-width: $responsive-menu-short) {
        display: block;
        text-align: left;
      }

      &.is-logo {
        float: left;
        font-size: 18px;
        margin-left: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.75px;
        opacity: 0.75;
        @media (max-width: 800px) {
          display: none;
        }
        &:hover {
          opacity: 1;
        }
      }
    }

    .app-menu-profile {
      height: $menu-height;
      float: right;
      display: flex;
      align-items: stretch;
      margin-right: -0.5rem;

      .app-menu-item {
        & > svg {
          fill: currentColor;
          width: 1.25rem;
          vertical-align: sub;
        }
      }
      @media (max-width: 830px) {
        display: none;
      }
    }

    .menu-auth-icon {
      display: inline-block;
      width: 32px;
      height: 32px;
      border: none;
      padding: 0;
      vertical-align: top;
    }

    .unlock-svg {
      font-size: 16px;
      font-weight: 600;
      color: #4C3C0F;
      line-height: 24px;
      padding: 0 16px;
      background: #FED9A3;
      border-radius: 6px;
      height: 32px;

      &.is-hidden {
        display: none;
      }
    }
  }

  .app-menu-enter-active, .app-menu-leave-active {
    transition: all 0.2s;
  }

  .app-menu-enter, .app-menu-leave-active {
    opacity: 0;
  }
</style>
