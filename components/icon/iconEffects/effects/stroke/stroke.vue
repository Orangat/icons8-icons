<template lang="pug">
  .effect-options-stroke
    .effect-options-field.is-flex.is-bottom-border
      label {{ $t('WEB_APP.EFFECT.COLOR') }}
      color-picker(
        v-model="params.color"
        tooltip="Stroke color"
        v-bind:show-color="true"
        v-bind:position="'effects'"
      )
    .effect-options-field
      label {{ $t('WEB_APP.EFFECT.STROKE_SIZE') }}
      range-input(
        v-bind:min="min"
        v-bind:max="max"
        suffix=" px"
        v-model="params.radius"
      )
</template>

<script>
import effect from './index'

export default {
  data () {
    return {
      params: Object.assign({ showHelpers: true }, effect.params),
      min: 1,
      max: 40
    }
  },
  watch: {
    'params.radius' () {
      if (this.params.radius < this.min) {
        this.params.radius = this.min
      }
      if (this.params.radius > this.max) {
        this.params.radius = this.max
      }
      effect.activate(this.params)
    },
    'params.color' () {
      effect.activate(this.params)
    }
  }
}
</script>
