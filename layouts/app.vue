<template lang="pug">
  div
    app-icons-menu(v-bind:locale="locale")
    .app
      app-left-sidebar(v-bind:locale="locale")
      app-page(v-bind:sidebars="sidebars" v-on:clicked="hideSidebars")
        nuxt
      app-right-sidebar(v-bind:locale="locale")
</template>

<script>
import appLeftSidebar from '~/components/app/appLeftSidebar.vue'
import appRightSidebar from '~/components/app/appRightSidebar.vue'

import { mapState, mapActions } from 'vuex'

export default {
  components: {
    appLeftSidebar,
    appRightSidebar
  },
  head () {
    return {
      ...this.seo
    }
  },
  computed: {
    ...mapState({
      seo: state => state.seo.data,
      appInfo: state => state.appInfo,
      locale: state => state.i18n.locale,
      sidebars: state => state.ui.sidebars,
      rightSidebar: state => state.ui.sidebars.right.active
    })
  },
  created () {
    this.enableLeftSidebar()
    this.enableRightSidebar()
  },
  methods: {
    ...mapActions([
      'enableLeftSidebar',
      'enableRightSidebar',
      'hideLeftSidebar',
      'hideRightSidebar'
    ]),
    hideSidebars () {
      this.hideLeftSidebar()
      this.hideRightSidebar()
    }
  }
}
</script>
