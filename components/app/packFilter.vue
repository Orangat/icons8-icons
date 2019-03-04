<template lang="pug">
  .pack-filter
    menu-list(
      v-bind:items="packList"
    )
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PackFilter',
  computed: {
    ...mapState({
      packs: state => state.appInfo.packs,
      lang: state => state.i18n.locale
    }),
    packList () {
      // format for menu
      let formattedList = this.packs.map(pack => {
        const name = pack.name[this.lang] || pack.name['en-US']
        return {
          code: pack.code,
          title: pack.free ? `${name} <span class="badge is-right">Free SVG</span>` : name,
          url: `/icons/pack/${pack.code}`
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

      // move freeIcons on top of list
      let freeIconsIndex = -1
      formattedList.some((pack, i) => {
        if (pack.code === 'free-icons') {
          freeIconsIndex = i
          return true
        }
      })
      if (freeIconsIndex > -1) {
        let freePack = Object.assign({}, formattedList.splice(freeIconsIndex, 1)[0])
        formattedList = [freePack].concat(formattedList)
      }
      return formattedList
    }
  }
}
</script>
