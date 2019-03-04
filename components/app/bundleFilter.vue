<template lang="pug">
  .bundle-filter
    app-expand(
      v-show="bundles.length"
      v-bind:title="'Bundles'"
    )
      menu-list(
        v-bind:items="bundleList"
      )
</template>
<script>
import axios from '~/plugins/axios'
import { mapState } from 'vuex'

export default {
  name: 'bundleFilter',
  data: () => ({
    bundles: []
  }),
  computed: {
    ...mapState({
      user: state => state.auth.user,
      lang: state => state.i18n.locale
    }),
    bundleList () {
      return this.bundles.map(bundle => ({ title: bundle.name, url: `/icon/collections/${bundle.key}` }))
    }
  },
  watch: {
    'user.loaded' () {
      this.fetch()
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    fetch () {
      if (this.user.loaded && !this.user.isGuest) {
        axios
          .request({
            url: '/api/bundle/list',
            params: {
              hash: this.user.authToken,
              access: 'subscribed',
              language: this.locale
            }
          })
          .then(response => {
            if (response.data.success) {
              this.bundles = response.data.result.list.bundles
            }
          })
          .catch(error => {
            console.error('Bundle list error', error)
          })
      }
    }
  }
}
</script>
