<template lang="pug">
  .range-input
    range-slider(
      v-bind:min="min"
      v-bind:max="max"
      v-bind:step="step"
      v-model="computedValue"
    )
      input.input(
        slot="start"
        v-model="formattedValue"
        v-on:blur="onBlur"
        v-on:focus="onFocus"
      )
</template>

<script>
export default {
  name: 'RangeInput',
  props: {
    value: {
      type: Number,
      'default': 0
    },
    min: {
      type: Number,
      'default': 0
    },
    max: {
      type: Number,
      'default': 100
    },
    step: {
      type: Number,
      'default': 1
    },
    prefix: {
      type: String,
      'default': ''
    },
    suffix: {
      type: String,
      'default': ''
    }
  },
  data () {
    return {
      isActive: false
    }
  },
  computed: {
    computedValue: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    },
    formattedValue: {
      get () {
        if (this.isActive) {
          return this.value
        } else {
          return this.formatValue(this.value)
        }
      },
      set (value) {
        this.$emit('input', parseInt(this.cleanValue(value)))
      }
    }
  },
  methods: {
    formatValue (value) {
      return `${this.prefix}${this.value}${this.suffix}`
    },
    cleanValue (value) {
      const v = value ? (isNaN(parseInt(value)) ? this.min : value) : this.min
      return ('' + v).split(this.prefix).join('').split(this.suffix).join('')
    },
    onBlur () {
      this.isActive = false
    },
    onFocus () {
      this.isActive = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .range-input {
    .input {
      width: 48px;
      padding: 5px;
      margin-right: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    &.is-generate-html{
      .input{
        background: #F3F3F3;
      }
    }
  }
</style>
