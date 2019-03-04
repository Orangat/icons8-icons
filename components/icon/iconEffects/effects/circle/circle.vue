<template lang="pug">
  .effect-options-circle
    .effect-options-field.is-flex
      label {{ $t('WEB_APP.EFFECT.COLOR') }}
      .fill-wrap
        label {{ $t('WEB_APP.EFFECT.FILL') }} &nbsp;
        input.switch.is-mini(
          type="checkbox"
          id="circle.fill"
          v-model="params.fill"
        )
        label.fill-label(for="circle.fill") &nbsp;
      color-picker(
        v-model="params.color"
        tooltip="Circle color"
        v-bind:show-color="true"
        v-bind:position="'effects'"
      )

    transition(name="effect-option" mode="in-out")
      .effect-options-field(v-if="!params.fill")
        label {{ $t('WEB_APP.EFFECT.STROKE_SIZE') }}
        range-input(
          v-bind:min="1"
          v-bind:max="10"
          v-model="params.borderWidth"
        )

    .effect-options-field
      label {{ $t('WEB_APP.EFFECT.CIRCLE_SIZE') }}
      range-input(
        v-bind:min="1"
        v-bind:max="100"
        suffix=" %"
        v-model="params.radius"
      )

    .effect-options-field
      label {{ $t('WEB_APP.EFFECT.ICON_SIZE') }}
      range-input(
        v-bind:min="min"
        v-bind:max="max"
        suffix=" %"
        v-model="params.iconSize"
      )
</template>

<script>
  import effect from './index'

  export default {
    name: 'effectOptionsCircle',
    data () {
      return {
        params: Object.assign({showHelpers: true}, effect.params),
        min: 40,
        max: 140
      }
    },
    watch: {
      'params.fill' () {
        effect.activate(this.params)
      },
      'params.borderWidth' () {
        effect.activate(this.params)
      },
      'params.radius' () {
        effect.activate(this.params)
      },
      'params.iconSize' () {
        effect.activate(this.params)
      },
      'params.color' () {
        effect.activate(this.params)
      }
    }
  }
</script>
