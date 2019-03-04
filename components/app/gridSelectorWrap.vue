<template lang="pug">
  .grid-selector-wrap
    grid-selector(v-bind:extended="extended")
</template>

<script>
export default {
  name: 'GridSelectorWrap',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    extended: {
      type: Boolean,
      'default': false
    }
  }
}
</script>

<style lang="scss" scoped>
  .grid-selector-wrap {
    float: right;
  }
</style>
