<template lang="pug">
  .app-ads
    .container(v-if="isEnabled")
    .close(v-if="isEnabled" v-html="$icons.cancel" @click.prevent="closeAd")
    transition(name="fade")
      .after-ad(v-if="adClosed")
        .native-main
          span.after-ad-title Remove ads
        a.upgrade(href="http://icons8.com/buy") Upgrade
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'AppAds',
  props: {
    landingAds: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      container: undefined,
      isEnabled: true,
      adClosed: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.auth.user
    })
  },
  watch: {
    '$route' () {
      this.loadAds()
    },
    'user.isGuest' () {
      if (this.user.loaded && (this.user.isGuest || this.user.activeLicense)) {
        this.loadAds()
      } else {
        this.disableAds()
      }
    }
  },
  mounted () {
    this.container = this.$el.querySelector('.container')
    this.loadAds()
  },
  methods: {
    loadAds () {
      this.cleanAds()
      if (this.user.isGuest && this.lang !== 'zh-cN') {
        this.isEnabled = true
        const ads = document.createElement('script')
        ads.setAttribute('src', '//cdn.carbonads.com/carbon.js?serve=CKYIV27I&placement=icons8com')
        ads.async = true
        ads.setAttribute('type', 'text/javascript')
        ads.setAttribute('id', '_carbonads_js')
        this.container.appendChild(ads)
      }
    },
    cleanAds () {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild)
      }
    },
    closeAd () {
      this.isEnabled = false
      this.adClosed = true
    },
    disableAds () {
      this.isEnabled = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .app-ads {
    max-width: 280px;
    position: fixed;
    z-index: 20;
    right: 20px;
    bottom: 100px;

    &:after {
      content: "";
      display: table;
      clear: both;
    }
  }

  .container {
    & /deep/ #carbonads {
      font-size: 12px;
      color: #fff;
      text-align: left;
      background: linear-gradient(-30deg, rgba(45, 182, 124, 0.85), rgba(45, 182, 124, 0.85) 45%, rgb(45, 182, 124) 65%) rgb(255, 255, 255);
      max-width: 200px;
      display: flex;
      z-index: 10;
      border-radius: 8px;
      border: solid 1px #f2f2f2;
      padding: 18px 20px;
      text-decoration: none;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }

    & /deep/ .carbon-poweredby {
      display: block;
      color: #fff;
      letter-spacing: 1px;
      font-weight: 500;
      font-size: 8px;
      line-height: 18px;
      margin-top: 5px;
      text-transform: uppercase;
    }

    & /deep/ .carbon-img {
      text-decoration: none;
      border: none;
      display: flex;
      justify-content: center;
      margin-bottom: 10px;
    }
    & /deep/ .carbon-text {
      color: #fff;
      text-decoration: none;
      border: none;
      letter-spacing: 1px;
      font-weight: 500;
      font-size: 12px;
      line-height: 18px;
      margin: 10px 0;
    }
  }

  .close {
    position: absolute;
    z-index: 12;
    width: 14px;
    height: 26px;
    top: 6px;
    right: 10px;
    cursor: pointer;
    /deep/ svg {
      fill: white;
    }
    &.is-black {
      /deep/ svg {
        fill: black;
      }
    }
  }

  .after-ad {
    position: absolute;
    font-size: 15px;
    display: flex;
    width: 200px;
    height: 60px;
    bottom: 0px;
    z-index: 5;
    padding: 0 20px;
    right: 0px;
    border-radius: 8px;
    justify-content: space-between;
    align-items: center;
    background: #363250;
    .native-main {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 400;
    }
    .upgrade {
      background-color: #FED9A3;
      border-radius: 8px;
      padding: 5px 8px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.7);
      font-weight: 400;
    }
  }
</style>
