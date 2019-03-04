<template lang="pug">
  .app-page(
    v-app-scroll
    data-simplebar
    v-bind:class="pageClasses"
    v-on:click="onClick"
  )
    slot
</template>

<script>
export default {
  name: 'AppPage',
  props: {
    sidebars: {
      type: Object,
      'default': () => {
        return {
          left: {},
          right: {}
        }
      }
    }
  },
  computed: {
    pageClasses () {
      return {
        'is-left-sidebar-disabled': !this.sidebars.left.enabled,
        'is-right-sidebar-disabled': !this.sidebars.right.enabled,
        'is-right-sidebar-active': this.sidebars.right.active
      }
    }
  },
  methods: {
    onClick () {
      this.$emit('clicked')
    }
  }
}
</script>

<style lang="scss">
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';
  @import '../../assets/css/mixins';

  .clearfix:after {
    display: block;
    content: '';
    clear: both;
  }

  .app-page {
    position: absolute;
    top: 0;
    left: $left-sidebar-width;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    transition: 0.3s all ease;
    background: #fff;

    @media (max-width: $responsive-app-left-sidebars) {
      left: 0;
      width: 100%;
    }

    &[data-simplebar] {
      position: absolute;
    }

    &.is-left-sidebar-disabled {
      left: 0;
    }
    &.is-static {
      position: static;
    }

    .app-page-title {
      padding: 0;
      text-align: center;
      font-weight: 400;
      &:first-letter {
        text-transform: capitalize;
      }

      &.is-left {
        text-align: left;
      }

      &.is-small {
        margin: 20px 0 16px 0;
        font-size: 32px;
        line-height: 48px;
        font-weight: 700;
      }

      .badge {
        margin: -2px 0 0 0.75rem;
      }

      &.is-platform {
        font-size: 40px;
        font-weight: 500;
        text-align: left;
        margin-left: 0;
        margin-top: 72px;
        margin-bottom: 16px;
        padding-left: 0;
        color: black;
        text-transform: capitalize;
      }

      & > .separator {
        color: #ccc;
      }
    }
    .app-page-subtitle {
      max-width: 50rem;
      padding: 0;
      margin: 12px auto;
      color: $color-font;
      text-align: center;
      font-size: 20px;

      @media (max-width: 800px) {
        font-size: 16px;
      }

      &.is-left {
        text-align: left;
      }

      &.is-small {
        font-size: 1rem;
        margin: 0;
      }

      &.is-platform {
        font-size: 16px;
        max-width: 100%;
        text-align: left;
        margin-left: 0;
        margin-bottom: 64px;
        padding-left: 0;
        color: black;
      }
    }
    .app-page-section {
      padding: 2.5rem 1rem;

      &:empty {
        display: none;
      }

      &.custom-padding {
        padding: 12px 40px;
      }
      &.short-padding {
        padding: 24px 24px 12px;
      }

      @media (max-width: 800px) {
        &.custom-padding {
          padding: 12px 20px;
        }
      }
      @media (max-width: $responsive-app) {
        padding: 1.5rem 1rem;
      }
      &.is-loading {
        @include loading;
      }
      &.is-underline {
        border-bottom: 1px solid $color-grey;
      }
      &.is-grey {
        background-color: #fafafa;
      }
    }
    .app-page-section-title {
      text-align: left;
      font-size: 12px;
      line-height: 16px;
      letter-spacing: 2px;
      margin-bottom: 8px;
      font-weight: 700;
      color: #4C4C4C;

      &:first-child {
        margin-top: 16px;
      }
    }
  }
</style>
