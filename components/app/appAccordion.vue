<template lang="pug">
  .app-accordion(v-if="isActive")
    .close(v-html="$icons.cancel" v-on:click="closeAccordion")
    icon-sidebar
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'AppAccordion',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    isActive: {
      type: Boolean,
      'default': false
    },
    locale: {
      type: String,
      'default': 'en-US'
    }
  },
  methods: {
    ...mapActions([
      'hideEffects'
    ]),
    closeAccordion () {
      this.hideEffects()
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
  .app-accordion {
    width: 100%;
    position: relative;

    .close {
      position: absolute;
      top: 10px;
      right: -20px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      z-index: 1;
      transition: all 0.3s;
      fill: rgba(0,0,0,0.5);
      @media (max-width: 800px) {
        right: 15px;
      }
    }
  }
</style>
