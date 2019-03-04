<template lang="pug">
  .nothing-found
    img.nothing-find-icon(src="/vue-static/icon/nothing.png" alt="nothing found")
    h2.nothing-found-title {{ $t('REQUEST_ICONS.NOT_FOUND.NOTHING', 'Nothing found') }}
    p {{ nothingFoundText }}
    a.button.is-small(v-bind:href="requestIconUrl") {{ $t('REQUEST_ICONS.FREE.REQUEST_ICON', 'Request icons')}}
</template>

<script>

export default {
  name: 'NothingFound',
  data () {
    return {
      nothingFoundText: this.$t('REQUEST_ICONS.NOT_FOUND.TEXT', 'Please tell us the icon you need, and we\'ll draw it for free.').split('<br')[0]
    }
  },
  computed: {
    requestIconUrl () {
      return `${process.env.backendUrl}/request-icon`
    }
  }
}
</script>

<style lang="scss" scoped>
  .nothing-found {
    padding: 2rem;
    text-align: center;

    .nothing-find-icon {
      width: 170px;
      height: 270px;
      margin: 0 auto 30px;
    }
    .nothing-found-title {
      font-size: 2rem;
    }
  }
</style>
