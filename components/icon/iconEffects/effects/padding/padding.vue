<template lang="pug">
  .effect-options-padding
    .effect-options-field
      label {{ $t('WEB_APP.EFFECT.PADDING.TITLE') }}
      range-input(
        v-bind:min="min"
        v-bind:max="max"
        suffix=" %"
        v-model="params.padding"
      )
</template>

<script>
import effect from './index'

export default {
  name: 'EffectOptionsPadding',
  data () {
    return {
      params: Object.assign({showHelpers: true}, effect.params),
      min: -30,
      max: 30,
      isActive: false
    }
  },
  watch: {
    'params.padding' () {
      effect.activate(this.params)
    }
  }
}
</script>
