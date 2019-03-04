<template lang="pug">
  .new-icons-page
    grid-selector-wrap
    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left
        nuxt-link(v-bind:to="'/icons'") {{ $t('ICON.ICONS.ICONS_LABEL') }}
        span.separator &nbsp;/&nbsp;
        nuxt-link(v-bind:to="`/icons/${platform.seoCode}`") {{ platform.title }}
        span.separator &nbsp;/&nbsp;
        span(v-html="title(platform)")
      .app-page-subtitle.is-small.is-left(v-html="description(platform)")

    .app-page-section.custom-padding
      app-native-ads(type="horizontal")
      app-ads

    .app-page-section.custom-padding
      page-scroll(
      v-on:fetch="fetchNext"
      v-bind:is-disabled="isScrollDisabled"
      v-bind:is-loading="isLoading"
      )
        template(v-for="(icons, key) in iconsByDate")
          h6.app-page-section-title {{ key }}
          icon-grid(
          v-bind:icons="icons"
          v-bind:grid-style="gridStyle"
          v-bind:action="'select'"
          v-bind:id="key"
          v-bind:active-grid="activeGrid"
          v-on:activate="activateGrid"
          )
        br
</template>

<script>
import { mapState } from 'vuex'

function fetchData ({ app, params, store, redirect }) {
  return new Promise(function (resolve) {
    store.dispatch('setPlatform', params.platform)
    const platform = store.state.platform.apiCode
    if (!store.state.appInfo.platforms[platform] || platform === 'all') {
      redirect('/icons/new/')
      return
    }
    store.dispatch('latest')
      .then(response => {
        if (!response.success) {
          resolve({ error: { message: response.message } })
          return
        }
        const count = platform === 'all' ? store.state.appInfo.iconsCount : store.state.appInfo.iconsCounts[platform]
        const defaultTitle = app.$t('WEB_APP.SEO.LATEST.TITLE_DEFAULT', { count })
        const title = app.$t(`WEB_APP.SEO.LATEST.TITLE_${platform.toUpperCase()}`, { count }, defaultTitle)
        store.dispatch('updateSEO', {
          title,
          description: app.$t('WEB_APP.SEO.LATEST.DESCRIPTION', {
            count: store.state.appInfo.iconsCount
          }),
          image: response.preview
        })
        getIconsByDate(response.icons)
          .then(iconsByDate => {
            resolve({
              ...response,
              iconsByDate
            })
          })
      })
      .catch(error => {
        console.log('error', error)
        resolve({
          icons: [],
          iconsByDate: {},
          error: {
            message: error.message
          }
        })
      })
  })
}

export default {
  name: 'NewIconsPage',
  layout: 'app',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect }) {
    if (process.server) {
      return fetchData({ app, params, store, redirect })
    }
    return {
      icons: [],
      iconsByDate: {},
      error: undefined
    }
  },
  data () {
    return {
      // title: this.$t('WEB_APP.NEW_ICONS'),
      subtitle: 'Our community <a href="https://icons8.com/request-icon/">requests the icons</a>; we draw them daily. Hey, community, we love you! Maybe for your ideas, and maybe it\'s just the smell, and that you make us laugh.',
      icons: [],
      iconsByDate: {},
      page: 1,
      isLoading: false,
      allIconsLoaded: false,
      activeGrid: undefined,
      fetchErrorsCount: 0
    }
  },
  computed: {
    ...mapState({
      gridStyle: state => state.ui.iconsGridStyle,
      platform: state => state.platform,
      lang: state => state.i18n.locale
    }),
    isScrollDisabled () {
      return this.isLoading || this.allIconsLoaded
    }
  },
  mounted () {
    if (!this.icons.length) {
      this.fetchData(this.$route.params)
    }
    this.checkError()
  },
  methods: {
    description (platform) {
      const size = platform.size
      return this.$t(`PLATFORMS.${platform.apiCode}.DESCRIPTION`, `<p>These icons are <a href="">pixel-perfect</a> at ${size}×${size} pixels and are available in PNG, SVG, and PDF. Unlike other websites, Icons8 creates most of these icons in-house, ensuring the stable quality.</p>`)
    },
    title (platform) {
      return this.$t(`PLATFORMS.${platform.apiCode}.NEW_ICONS`, 'New Icons')
    },
    activateGrid (key) {
      this.activeGrid = key
    },
    fetchData (params) {
      return new Promise((resolve) => {
        this.isLoading = true
        fetchData({
          app: this,
          store: this.$store,
          params
        })
          .then(response => {
            this.isLoading = false
            this.icons = response.icons
            this.iconsByDate = response.iconsByDate
            this.checkError(response.error)
            resolve()
          })
          .catch(error => {
            this.isLoading = false
            console.log('error', error)
            this.checkError(error)
            resolve()
          })
      })
    },
    fetchNext () {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      this.$store.dispatch('latest', { page: this.page + 1 })
        .then(response => {
          this.page++
          if (response.success && response.icons.length) {
            response.icons.forEach(icon => {
              this.icons.push(icon)
            })
            getIconsByDate(this.icons)
              .then(iconsByDate => {
                this.iconsByDate = iconsByDate
              })
          } else {
            this.allIconsLoaded = true
          }
          this.isLoading = false
        })
        .catch(error => {
          this.isLoading = false
          this.fetchErrorsCount++
          if (this.fetchErrorsCount === 3) {
            this.allIconsLoaded = true
          }
          console.error('page error', error && error.message ? error.message : error)
        })
    },
    checkError (error = this.error) {
      if (error) {
        console.log('this.error', this.error)
        this.error = undefined
      }
    }
  }
}

function getIconsByDate (icons) {
  return new Promise(function (resolve) {
      import(/* webpackChunkName: "moment" */ 'moment')
        .then(result => {
          const moment = result.default
          let iconsByDate = {}
          icons.forEach(icon => {
            let date = humanizeDate(new Date(icon.timestamp * 1000))
            iconsByDate[date.date] = iconsByDate[date.date] || []
            iconsByDate[date.date].push(icon)
          })
          resolve(iconsByDate)

          function humanizeDate (date) {
            let result = {
              date: '',
              code: ''
            }
            let $date = moment(date)
            $date.locale('en')

            switch (when($date)) {
              case 'today':
                result.date = 'Today'
                result.code = 'today'
                break
              case 'yesterday':
                result.date = 'Yesterday'
                result.code = 'yesterday'
                break
              case 'this_week':
                result.date = $date.format('dddd')
                result.code = result.date.toLowerCase()
                break
              case 'last_week':
                result.date = 'Last ' + $date.format('dddd')
                result.code = 'last_' + result.date.toLowerCase()
                break
              case 'this_year':
                result.date = $date.format('MMMM')
                break
              default:
                result.date = $date.format('MMMM YYYY')
            }
            return result
          }

          function when ($date) {
            let $today = moment().startOf('day')

            // if today
            if ($today.diff($date) < 0) {
              return 'today'

              // if yesterday
            } else if ($today.diff($date) > 0 && $today.diff($date, 'hour') < 24) {
              return 'yesterday'

              // if this week
            } else if ($today.diff($date, 'day') + 1 <= $today.weekday()) {
              return 'this_week'

              // if last week
            } else if (
              $today.diff($date, 'day') + 1 > $today.weekday() &&
              $today.diff($date, 'day') + 1 <= ($today.weekday() + 7)) {
              return 'last_week'

              // if this year
            } else if ($today.year() === $date.year()) {
              return 'this_year'

              // any other dates
            } else {
              return 'other'
            }
          }
        })
        .catch(error => {
          console.error('Failed to load moment bundle', error)
          resolve({})
        })
  })
}
</script>
