<template lang="pug">
  .effect-options-overlay
    .effect-options-field.is-flex.is-bottom-border(v-if="canRecolor")
      label {{ $t('WEB_APP.EFFECT.COLOR') }}
      color-picker(
        v-model="params.color"
        tooltip="Stroke color"
        :show-color="true"
        :position="'effects'"
      )
    .no-overlays(v-if="!platformIcons") Sorry, there are no overlays for this style yet
    .grid(v-if="platformIcons" :class="{'is-alone': !canRecolor}")
      .icon(
        v-for="(icon, index) in platformIcons"
        :key="index"
        @click="selectIcon(index)"
      )
        app-icon.is-small(
          :svg="icon"
          :class="{'is-active': selectedIcon === index}"
        )
</template>

<script>
import effect from './index'

export default {
  name: 'EffectOptionsOverlay',
  props: {
    icon: {
      type: Object,
      'default': {}
    },
    platform: {
      type: Object,
      'default': {
        isColor: true
      }
    }
  },
  data () {
    return {
      selectedIcon: undefined,
      icons: undefined,
      params: Object.assign({ showHelpers: true }, effect.params)
    }
  },
  computed: {
    platformIcons () {
      if (!this.icons) {
        return undefined
      }
      const platform = this.icon.platform || 'color'
      let overlays = this.icons[platform]
      if (platform === 'office') {
        overlays = overlays[40]
      }
      return overlays
    },
    canRecolor () {
      return (!this.platform.isColor || this.platform.apiCode === 'm_two_tone') && this.icons
    }
  },
  watch: {
    'params.color' () {
      effect.activate(this.params)
    }
  },
  mounted () {
    import(/* webpackChunkName: "effects" */ './icons').then(icons => {
      this.icons = icons.default
      this.selectedIcon = 0
    }).catch(error => {
      console.error('Failed to load overlay icons', error)
    })
  },
  methods: {
    selectIcon (index) {
      this.selectedIcon = index
      if (this.params.id !== index || !effect.isActive) {
        this.params.id = index
        effect.activate(this.params)
      }
      effect.isActive = true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../../../assets/css/variables';

  .effect-options-overlay {
    position: relative;
    height: 100%;
    max-height: 290px;
    margin-bottom: 15px;

    .grid {
      position: relative;
      overflow-y: auto;
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      max-height: 215px;
      height: 100%;

      &.is-alone {
        top: 0;
      }
    }

    .no-overlays {
      padding: 20px 12px;
      text-align: center;
      font-size: 14px;
    }

    & /deep/ .app-icon {
      width: 40px;
      height: 41px;
      cursor: pointer;
      border: 2px solid transparent;

      &:hover {
        border: 2px solid $color-grey-light;
        border-radius: 5px;
      }
      &.is-active {
        border: 2px solid $color-blue;
        border-radius: 5px;
      }
    }
  }
</style>
