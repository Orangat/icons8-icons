<template lang="pug">
  .auto-complete
    .app-search-icon(
      v-html="$icons.search"
      v-on:click="submit"
    )
    input.auto-complete-input(
      aria-label="Search"
      v-bind:placeholder="placeholder"
      v-bind:value="value"
      v-bind:class="{'is-in-focus': inputInFocus}"
      v-on:input="updateValue($event.target.value)"
      v-on:keyup.13="submit"
      v-on:keyup.up="prevOption"
      v-on:keyup.down="nextOption"
      ref="input"
    )
    transition(name="slide-down")
      .panel.auto-complete-list(v-if="isOptionsShown && options && options.length")
        .list
          .list-item(
            v-for="(option, index) in options"
            v-on:click="selectOption(index)"
            v-bind:class="{'is-active': index === activeIndex}"
        ) {{ option }}
</template>

<script>
export default {
  name: 'AutoComplete',
  props: {
    value: {
      type: String, 'default': ''
    },
    options: {
      type: Array, 'default': []
    },
    placeholder: {
      type: String, 'default': ''
    }
  },
  data () {
    return {
      input: undefined,
      isOptionsShown: false,
      activeIndex: -1,
      inputInFocus: undefined
    }
  },
  computed: {
    mobileSearchActive () {
      return this.$store.state.ui.mobileSearchActive
    }
  },
  watch: {
    options () {
      this.activeIndex = -1
    },
    mobileSearchActive (isActive) {
      isActive && this.$refs.input.focus()
    }
  },
  mounted () {
    this.input = this.$el.childNodes[0]
    document.documentElement.addEventListener('click', this.outsideClick, false)
  },
  beforeDestroy () {
    document.documentElement.removeEventListener('click', this.outsideClick, false)
  },
  methods: {
    updateValue (value) {
      this.$emit('input', value)
      this.$emit('suggest', value)
      this.isOptionsShown = true
    },
    submit () {
      if (this.isOptionsShown) {
        this.selectOption(this.activeIndex)
      }
      this.$emit('submit')
    },
    selectOption (index) {
      let option = this.options[index]
      if (option) {
        this.$emit('input', option)
      }
      this.input.focus()
      this.isOptionsShown = false
    },
    nextOption () {
      this.activeIndex++
      if (this.activeIndex >= this.options.length) {
        this.activeIndex = 0
      }
    },
    prevOption () {
      this.activeIndex--
      if (this.activeIndex < 0) {
        this.activeIndex = this.options.length - 1
      }
    },
    outsideClick (e) {
      if (!this.$el.contains(e.target)) {
        this.isOptionsShown = false
      }
    }
  }
}
</script>

<style lang="scss">
  $search-height: 40px;

  .auto-complete {
    position: relative;
    border-radius: 6px;
    width: 776px;
    @media (max-width: 1230px) {
      width: 576px;
    }
    @media (max-width: 1030px) {
      width: 476px;
    }
    @media (max-width: 830px) {
      width: 100%;
    }

    .app-search-icon {
      position: absolute;
      z-index: 2;
      top: 1px;
      right: 0;
      width: $search-height;
      height: $search-height;
      line-height: 46px;
      padding: 8px;
      cursor: pointer;
      margin-right: 4px;

      svg {
        width: 100%;
        height: 100%;
        fill: #000;
        vertical-align: top;

        &:hover {
          fill: #888;
        }
        g {
         stroke: #000;
       }
      }
      svg:not(:root) g {
        stroke: #000;
      }
    }

    .auto-complete-input {
      position: relative;
      z-index: 1;
      line-height: 40px;
      padding: 0 32px 0 16px;
      border: none;
      font-weight: 700;
      font-size: 18px;
      width: 100%;
      background: #fff;
      color: #000;
    }
    .auto-complete-list {
      position: absolute;
      z-index: 1;
      width: 100%;
      transition: 0.3s all ease;

      opacity: 1;
      transform: translateY(0);
    }
  }

  // transition
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease-in-out;
  }
  .slide-down-enter,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-16px) scale(0.97);
  }
</style>
