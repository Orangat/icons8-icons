<template lang="pug">
  .effect-options-recolor
    .effect-options-field.is-bottom-border
      .colors
        .color(
          v-for="color in allColors"
          v-on:click="activateColor(color)"
          v-bind:style="{background: color.currentColor, color: color.currentColor}"
          v-bind:class="{'is-active': color === activeColor}"
        )
    .effect-options-field
      color-panel(v-if="activeColor" v-model="activeColor.currentColor")
</template>

<script>
import effect from '.'

export default {
  name: 'EffectOptionsRecolor',
  data () {
    return {
      allColors: [],
      params: effect.params,
      activeColor: null
    }
  },
  watch: {
    'params.colorsMap': {
      handler (newQuestion, oldQuestion) {
        if (newQuestion === oldQuestion) { // old palete colors (old icon)
          effect.activate()
          effect.isActive = true
        } else { // new palete colors (new icon)
          this.allColors = effect.params.colorsMap
          this.activeColor = this.allColors[Object.keys(this.allColors)[0]]
          setTimeout(() => {
            effect.isActive = true
            effect.activate()
          }, 100)
        }
      },
      deep: true
    }
  },
  mounted () {
    this.allColors = effect.params.colorsMap
    this.activeColor = this.allColors[Object.keys(this.allColors)[0]]
  },
  methods: {
    activateColor (color) {
      this.activeColor = color
    }
  }
}
</script>

<style lang="scss" scoped>
  .effect-options-recolor {
    .colors {
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
    }
    .color {
      display: inline-block;
      width: 28px;
      height: 28px;
      margin: 3px;
      vertical-align: top;
      border-radius: 50%;
      border: 2px solid transparent;
      box-shadow: 0 0 1px 1px transparent;
      transition: 0.3s all ease;
      cursor: pointer;

      &.is-active, &:hover {
        border: 2px solid white;
        box-shadow: 0 0 1px 1px currentColor;
      }
    }
    .color-panel {
      margin-top: 16px;
    }
    .effect-options-field {
      .color-picker {
        float: none;
        margin-right: 0.25rem;
        width: 20px;
      }
      .color-picker-toggle {
        top: 0;
        margin: 0;
      }
    }
  }
</style>
