<template lang="pug">
  .collections-page
    .app-page-section.custom-padding
      h1.app-page-title.is-small.is-left {{ name }}

    .app-page-section.custom-padding
      app-native-ads(type="horizontal")
      app-ads

    .app-page-section.custom-padding
      icon-grid(
        v-bind:icons="icons"
        v-bind:grid-style="gridStyle"
        v-bind:action="'select'"
      )
</template>

<script>
import axios from '~/plugins/axios'
import { mapState } from 'vuex'

export default {
  name: 'CollectionsPage',
  layout: 'app',
  scrollToTop: true,
  data: () => ({
    icons: [],
    name: undefined,
    error: undefined
  }),
  computed: {
    ...mapState({
      gridStyle: state => state.ui.iconsGridStyle,
      user: state => state.auth.user,
      locale: state => state.i18n.locale
    })
  },
  watch: {
    '$route' () {
      this.fetch()
    },
    'user.loaded' () {
      this.fetch()
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      return new Promise((resolve) => {
        if (this.user.loaded && !this.user.isGuest) {
          axios
            .request({
              url: '/api/bundle/icons',
              params: {
                hash: this.user.authToken,
                bundle: this.$route.params.id,
                language: this.locale
              }
            })
            .then(response => {
              if (response.data.success) {
                const result = response.data.result
                this.name = result.bundle.name
                this.icons = result.icons
                try {
                  this.icons.forEach(icon => {
                    if (icon.id) {
                      icon.svg = icon.svg ? atob(icon.svg) : icon.svg
                    }
                  })
                } catch (error) {
                  let isAtob = error ? error.toString().indexOf(`Failed to execute 'atob' on 'Window'`) : null
                  if (isAtob) {
                    console.info(error)
                  } else {
                    console.error(error)
                  }
                }
              }
              resolve()
            })
            .catch(error => {
              console.error('Fetch bundle icons error', error)
              resolve()
            })
        } else {
          resolve()
        }
      })
    }
  }
}
</script>
