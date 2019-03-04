<template lang="pug">
  .request-icon
    p(v-html="$t('REQUEST_ICONS.WEBAPP_REQUEST.TEXT')")
    a.button.is-small(v-bind:href="requestIconUrl" v-html="$t('REQUEST_ICONS.TITLE')")
</template>

<script>

export default {
  name: 'RequestIcon',
  computed: {
    requestIconUrl () {
      return `${process.env.backendUrl}/request-icon`
    }
  }
}
</script>

<style lang="scss" scoped>
  .request-icon {
    padding: 50px 0;
    text-align: left;

    p {
      margin-bottom: 15px;
    }
  }
</style>
