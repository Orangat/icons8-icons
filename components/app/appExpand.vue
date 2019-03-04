<template lang="pug">
  .app-expand(v-bind:class="toggleClasses")
    .title(v-on:click="toggle") {{ title }}
      .submenu-toggle(v-html="$icons.arrowDown" v-bind:class="toggleClasses")
    .toggle(v-html="$icons.arrowDown" v-on:click="toggle")
    transition(name="app-expand" mode="in-out")
      .content(v-if="active")
        slot
</template>

<script>
export default {
  name: 'AppExpand',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    title: {
      type: String,
      'default': ''
    },
    isOpen: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      active: false
    }
  },
  computed: {
    toggleClasses () {
      return {
        'is-open': this.active
      }
    }
  },
  created () {
    this.active = this.isOpen
  },
  methods: {
    toggle () {
      this.active = !this.active
    },
    open () {
      this.active = true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';

  .app-expand {
    position: relative;
    user-select: none;
    transition: all 0.4s ease;

    &.is-open {
      .toggle {
        top: 1px;
        & > /deep/ svg {
          transform: rotate(180deg);
        }
      }
    }

    .title {
      height: 32px;
      line-height: 32px;
      padding: 0 8px 0 24px;
      font-weight: 700;
      color: #B4D5FF;
      opacity: 0.5;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.4s ease;
      font-size: 12px;

      &:hover {
        background: rgba(96,96,156,1);
      }
    }

    .toggle {
      position: absolute;
      top: 2px;
      right: 16px;

      & > /deep/ svg {
        transform: rotate(0deg);
        transition: all 0.5s ease;
        fill: currentColor;
        width: 8px;
        height: 8px;
      }
    }
    .submenu-toggle {
      display: none;
      margin-right: 6px;
      & > /deep/ svg {
        transform: rotate(0deg);
        transition: all 0.5s ease;
        fill: currentColor;
        width: 8px;
        height: 8px;
      }
      &.is-open {
        top: 1px;
        & > /deep/ svg {
          transform: rotate(180deg);
         }
      }
    }

    .content {
      user-select: all;
      min-height: 16px;

      // transition
      &.app-expand-enter-active,
      &.app-expand-leave-active {
        max-height: 1500px;
        transition: all 0.8s ease, opacity 0.4s 0.2s ease;
      }
      &.app-expand-enter,
      &.app-expand-leave-to {
        min-height: 0;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
        transition: all 0.5s ease, opacity 0.3s ease;
      }

      & /deep/ .list {
        padding-top: 0;
        color: white;

        &>.list-item{
          padding: 0 8px 0 32px;
          line-height: 32px;
          opacity: 1;
          width: 100%;
          margin: 0 auto;
          border-radius: 0;
          font-weight: 400;

          &:hover {
            background-color: rgba(96,96,156,1);
          }
          &.is-active {
            background-color: rgba(92, 162, 253, .3);
          }
        }
      }
    }
  }

</style>
