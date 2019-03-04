<template lang="pug">
  .icon-recolor
    color-picker(
      v-model="color"
      v-bind:preview-color="true"
      v-bind:position="position"
      v-on:open="onOpen"
      v-bind:inEffects="true"
    )

</template>

<script>
export default {
  name: 'IconRecolor',
  props: {
    position: {
      'default': 'bottom-right'
    }
  },
  data () {
    return {
    }
  },
  computed: {
    color: {
      get () {
        return this.$store.state.icon.color
      },
      set (value) {
        this.$store.dispatch('changeColor', value)
      }
    }
  },
  methods: {
    onOpen () {
      this.$analytics.track({
        event: 'Recolored',
        category: 'Editing'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .icon-recolor {
    & /deep/ .color-picker {
      vertical-align: middle;
      margin-right: 6px;
    }
  }
</style>
