<template lang="pug">
  .effect-options-text
    .effect-options-field.text-options
      .option-description Text
      textarea(v-model="params.text" ref="text")

    .effect-options-field.is-bottom-border
      app-select(
        v-model="params.font"
        v-bind:options="fonts"
        v-bind:title-key="'title'"
        v-bind:value-key="'name'"
      )
      .font-option-wrap
        .effect-options-text-bold(
          v-bind:class="{'is-active': params.isBold}"
          v-on:click="params.isBold = !params.isBold"
          v-html="effect.$.icons.bold"
        )
        .effect-options-text-bold(
          v-bind:class="{'is-active': params.isItalic}"
          v-on:click="params.isItalic = !params.isItalic"
          v-html="effect.$.icons.italic"
        )

    .effect-options-field.is-bottom-border.is-flex
      // Добавить в переводы "Size"
      label.label-size Size
      range-input(
        v-bind:min="min"
        v-bind:max="max"
        suffix=" px"
        v-model="params.size"
      )
    .effect-options-field.is-flex
      .option-description Color
      color-picker(
        v-model="params.color"
        tooltip="Text color"
        v-bind:show-color="true"
        v-bind:position="'effects'"
      )

</template>

<script>
import effect from './index'

export default {
  name: 'EffectOptionsText',
  data () {
    return {
      params: Object.assign({ showHelpers: true }, effect.params),
      min: 4,
      max: 200,
      fonts: [{
        name: 'Roboto',
        title: 'Roboto'
      }, {
        name: 'RobotoCondensed',
        title: 'Roboto Condensed'
      }, {
        name: 'RobotoSlab',
        title: 'Roboto Slab',
        noItalic: true
      }, {
        name: 'PTSans',
        title: 'PT Sans'
      }, {
        name: 'PTSerif',
        title: 'PT Serif'
      }],
      effect
    }
  },
  watch: {
    'params.text' () {
      effect.activate(this.params)
    },
    'params.font' () {
      effect.activate(this.params)
    },
    'params.isBold' () {
      effect.activate(this.params)
    },
    'params.isItalic' () {
      effect.activate(this.params)
    },
    'params.color' () {
      effect.activate(this.params)
    },
    'params.size' () {
      effect.activate(this.params)
    }
  },
  activated () {
    this.$refs.text.focus()
  }
}
</script>

<style lang="scss" scoped>
  .app-select.app-popup {
    font-weight: 600;
    font-size: 18px;
    color: #000000;
    width: auto;
    display: inline-block;
    margin: 0 0 -7px -8px;

    /deep/ .app-popup-toggle {
      padding: 0 12px 10px;
    }

    /deep/ .app-popup-content {
      width: auto;
    }

    .app-select-content {
      display: inline-block;
    }

    /deep/ .app-popup-arrow {
      position: relative;
      display: inline-block;
      margin-left: 6px;
      top: 10px;
      margin-top: 0;
      right: auto;
    }
  }

  .text-size-field {
    display: flex;
  }

  .font-option-wrap {
    position: relative;
    float: right;
    margin-top: 10px;
  }

  .label-size {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    order: 0;
    margin-right: 10px;
  }

  .range-slider {
    top: -4px;
  }

  .range-input {
    display: flex;
    order: 1;
  }

  .range-input .input {
    font-size: 14px;
    font-weight: 600;
    padding: 0 5px!important;
    margin-right: 0!important;
    width: 56px!important;
    margin-left: 14px;
    display: flex;
    order: 1;
  }

  .effect-options-text-bold {
    display: inline-block;
    width: 32px;
    height: 32px;
    line-height: 28px;
    text-align: center;
    font-size: 30px;
    font-weight: bold;
    color: #DAD8D8;
    transition: color .3s;
    cursor: pointer;

    &>svg {
      fill: #b2b2b2;
      transition: all 0.3s ease;
    }

    &.is-active {
      color: #5CA3FD;
      &>svg {
        fill: #000;
      }
    }
  }

  .option-description {
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    line-height: 16px;
    display: inline-block;
    padding-bottom: 8px;
  }
</style>
