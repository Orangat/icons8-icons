<template lang="pug">
  .seo-pack-filter
    menu-list(
      v-bind:items="packList"
    )
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'SeoPackFilter',
  computed: {
    ...mapState({
      packs: state => state.appInfo.seoPacks,
      lang: state => state.i18n.locale
    }),
    packList () {
      // format for menu
      let formattedList = this.packs.map(pack => {
        return {
          code: pack.code,
          title: pack.name[this.lang] || pack.name['en-US'],
          url: `/icons/set/${pack.code}`
        }
      })

      formattedList.sort((a, b) => {
        if (a.title > b.title) {
          return 1
        }
        if (a.title < b.title) {
          return -1
        }
        return 0
      })

      // add new icons
      formattedList.unshift({
        title: this.$t('WEB_APP.NEW_ICONS'),
        url: `/icons/new`
      })
      return formattedList
    }
  }
}
</script>
