<template lang="pug">
  .app-search
    .app-search-input
      auto-complete(
        v-bind:placeholder="$t('WEB_APP.SEARCH.PLACEHOLDER')"
        v-bind:options="options"
        v-model="term"
        v-on:submit="search"
        v-on:suggest="getOptions"
      )
      .platforms
        app-select(
          v-model="currentPlatform"
          v-bind:options="platformListValues"
          v-bind:title-key="'title'"
          v-bind:value-key="'apiCode'"
          v-on:change="changedPlatform"
        )
</template>

<script>
import searchIcon from '../../assets/svg/search.svg'
import collIcon from '../../assets/svg/collections.svg'

import api from '~/plugins/api'
import debounce from 'debounce'

import { mapState, mapActions } from 'vuex'

export default {
  name: 'AppSearch',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    gridSelector: {
      type: Boolean,
      'default': false
    },
    extendedGridSelector: {
      type: Boolean,
      'default': false
    },
    locale: {
      type: String,
      'default': 'en-US'
    }
  },
  data () {
    return {
      term: '',
      options: [],
      searchIcon,
      collIcon,
      currentPlatform: 'all'
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms,
      platform: state => state.platform
    }),
    platformListValues () {
      return Object.values(this.platforms).map(platform => {
        var title = this.$t(`PLATFORMS.${platform.apiCode}.SHORT_TITLE`, '')
        if (title) platform.title = title
        return platform
      })
    }
  },
  watch: {
    platform () {
      this.currentPlatform = this.platform.apiCode
    }
  },
  mounted () {
    this.currentPlatform = this.platform.apiCode
    if (this.$route.params.term) {
      this.term = this.$utils.prettifyValue(this.$route.params.term)
    }
  },
  methods: {
    ...mapActions([
      'showRightSidebar',
      'hideRightSidebar',
      'hideLeftSidebar'
    ]),
    changedPlatform () {
      console.log(this.term)
      if (this.term.length && this.term !== ' ') {
        this.search() // start search if changed currentPlatform
      }
    },
    search () {
      this.hideLeftSidebar()
      let term = this.term.replace('.', ' ')
      if (term) {
        if (this.currentPlatform && this.currentPlatform !== 'all') {
          this.$router.push({
            path: `/icon/set/${this.$utils.normalizeValue(term)}/${this.platforms[this.currentPlatform].seoCode}`
          })
        } else {
          this.$router.push({
            path: `/icons/set/${this.$utils.normalizeValue(term)}`
          })
        }
      }
    },
    getOptions: debounce(function (term) {
      const normalized = this.$utils.normalizeValue(term)
      if (!normalized || normalized.length < 3) {
        this.options = []
      } else {
        api.suggest({ normalized }).then(options => {
          this.options = options
        })
      }
    }, 300)
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/mixins';

  $search-height: 40px;
  $search-background: rgba(243, 243, 243, 0.98);
  $search-responsive-breakpoint: 'max-width: 830px';

  .app-search {
    display: flex;
    position: relative;
    float: left;
    z-index: 0;

    @media(#{$search-responsive-breakpoint}) {
      left: 0;
      float: none;
      width: 100%;
    }

    .app-search-input {
      position: relative;
      margin: 8px 0 0 0;

      @media(#{$search-responsive-breakpoint}) {
        margin: 0;
        width: 100%;
      }

      & /deep/ input {
        height: $search-height;
        @include font-bold;
        @media(#{$search-responsive-breakpoint}) {
          padding-right: 210px;
        }
        @media(max-width: 480px) {
          padding-right: 140px;
          font-size: 16px;
        }
      }
    }
  }

  .platforms {
    position: absolute;
    top: 0;
    right: 40px;
    z-index: 5;
    width: 170px;
    color: black;
    border-left: 1px solid #ddd;
    font-size: 1rem;
    @media(max-width: 480px) {
      width: 100px;
    }
    /deep/ {
      .app-select .app-select-content {
        @media(max-width: 480px) {
          text-overflow: ellipsis;
        }
      }
      .app-popup .app-popup-content {
        @media(max-width: 480px) {
          left: auto;
          right: 0;
        }
      }
    }
  }
</style>
