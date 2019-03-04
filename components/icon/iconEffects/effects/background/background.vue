<template lang="pug">
  .effect-options-background
    .effect-options-field.is-flex
      label {{ $t('WEB_APP.EFFECT.BACKGROUND.TITLE') }}
      color-picker(
        v-model="params.color"
        tooltip="Background color"
        v-bind:show-color="true"
        v-bind:position="'effects'"
      )
</template>

<script>
import effect from './index'

export default {
  data () {
    return {
      params: Object.assign({ showHelpers: true }, effect.params)
    }
  },
  watch: {
    'params.color' () {
      console.log('this.params.color', this.params.color)
      effect.activate(this.params)
    }
  }
}
</script>
