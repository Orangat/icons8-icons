<template lang="pug">
  div
    app-modal(
      name="effects-modal"
      v-bind:width="'auto'"
      v-bind:content-class="'effects-modal'"
    )
      // effects menu
      .effect-sliding-menu
        .effect-sliding-item(
          v-for="effect in singleEffects"
          v-on:click.self="selectEffect(effect)"
          v-bind:class="{'is-active': effect === currentEffect}"
        )
          .effect-modal-icon(
            v-html="effect.icon"
            v-on:click.self="selectEffect(effect)"
          )
          | {{ $t(effect.name, effect.id) }}
          .effect-sliding-item-toggle
            input.switch.is-mini(
              type="checkbox"
              v-bind:id="'icon-effect-' + effect.id"
              v-model="effect.isActive"
              v-on:change="toggleEffect(effect)"
            )
            label(v-bind:for="'icon-effect-' + effect.id")

        .effect-sliding-item.is-divider

        .effect-sliding-item(
          v-on:click="removeReplaceableEffects"
          v-bind:class="{'is-active': noEffects === currentEffect}"
        )
          | {{ $t(noEffects.name)}}

          .effect-sliding-item-toggle
            input.radio.is-mini(
              type="radio"
              name="replaceable"
              v-model="selectedReplaceable"
              v-bind:value="noEffects.id"
              v-bind:id="'icon-effect-' + noEffects.id"
            )
            label(v-bind:for="'icon-effect-' + noEffects.id")

        .effect-sliding-item(
          v-for="effect in replaceableEffects"
          v-on:click="selectEffect(effect)"
          v-bind:class="{'is-active': effect === currentEffect}"
        )
          .effect-modal-icon(v-html="effect.icon")
          | {{ $t(effect.name) }}

          .effect-sliding-item-toggle
            input.radio.is-mini(
              type="radio"
              name="replaceable"
              v-model="selectedReplaceable"
              v-bind:value="effect.id"
              v-bind:id="'icon-effect-' + effect.id"
            )
            label(v-bind:for="'icon-effect-' + effect.id")

      // selected effect option
      .effect-modal-options
        keep-alive
          component(v-bind:is="currentOptions" v-bind="{icon: icon, platform: platform}")


      // effects preview
      .effect-sliding-preview
        canvas.effect-sliding-preview-canvas.transparent-background(width="252" height="252" hidpi="off")

        .effect-sliding-preview-footer
          .effect-sliding-preview-icon.transparent-background(v-html="svgPreview")
          .button.is-small(v-on:click="saveEffects") {{ $t('WEB_APP.EFFECT.BUTTON.SAVE').split(' ')[0] }}
          a(v-on:click.prevent="cancel()") {{ $t('WEB_APP.EFFECT.BUTTON.CANCEL') }}

</template>

<script>
import effectOptionsRecolor from './effects/recolor/recolor.vue'
import effectOptionsOverlay from './effects/overlay/overlay.vue'
import effectOptionsText from './effects/text/text.vue'
import effectOptionsCircle from './effects/circle/circle.vue'
import effectOptionsStroke from './effects/stroke/stroke.vue'
import effectOptionsSquare from './effects/square/square.vue'
import effectOptionsBackground from './effects/background/background.vue'
import effectOptionsPadding from './effects/padding/padding.vue'
import effectsService from './effects/effectsService'
import { mapState } from 'vuex'
export default {
  name: 'effectsModal',
  components: {
    effectOptionsRecolor,
    effectOptionsOverlay,
    effectOptionsText,
    effectOptionsCircle,
    effectOptionsStroke,
    effectOptionsSquare,
    effectOptionsBackground,
    effectOptionsPadding
  },
  props: {
    icon: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      canvas: undefined,
      effects: effectsService.effects,
      currentEffect: effectsService.enabledEffect,
      noEffects: {
        id: 'noEffects',
        name: 'WEB_APP.EFFECT.NO_EFFECT.TITLE'
      },
      svgPreview: undefined,
      selectedReplaceable: ''
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms
    }),
    platform () {
      return this.platforms[this.icon.platform] || {isColor: true}
    },
    singleEffects () {
      return Object.keys(this.effects)
        .filter(key => this.effects[key].type === 'single')
        .map(key => this.effects[key])
    },
    replaceableEffects () {
      return Object.keys(this.effects)
        .filter(key => this.effects[key].type === 'replaceable')
        .map(key => this.effects[key])
    },
    currentOptions () {
      return `effectOptions${this.currentEffect.id}`
    }
  },
  mounted () {
    effectsService.onRender(this.onRender)
  },
  destroyed () {
    effectsService.offRender(this.onRender)
  },
  methods: {
    initEditor (effect) {
      this.canvas = this.$el.querySelector('.effect-sliding-preview-canvas')
      effectsService.initEditor(this.canvas)
        .then(this.initIcon)
        .then(() => {
          this.currentEffect = effect
          this.selectedReplaceable = effect.id
          this.selectEffect(effect)
        })
        .catch(error => {
          console.error(error)
        })
    },
    initIcon () {
      effectsService.initIcon(this.icon, this.platform, this.$store.state.icon.color)
      this.svgPreview = this.icon.svg
    },
    selectEffect (effect) {
      effectsService.enableEffect(effect.id)
      this.currentEffect = effect
      if (effect.type === 'replaceable') {
        this.selectedReplaceable = effect.id
      }
    },
    toggleEffect (effect) {
      if (effect.isActive) {
        effectsService.enableEffect(effect.id)
      } else {
        effectsService.disableEffect(effect.id)
      }
    },
    saveEffects () {
      if (effectsService.saveEffects()) {
        this.$emit('iconEffected', effectsService.resultSvg)
      } else {
        this.$emit('iconEffected', undefined)
      }
      this.$modal.hide('effects-modal')
    },
    removeReplaceableEffects () {
      effectsService.removeReplaceableEffects()
      this.currentEffect = this.noEffects
      this.selectedReplaceable = this.noEffects.id
    },
    cancel () {
      this.$modal.hide('effects-modal')
    },
    onRender (svg, meta) {
      this.svgPreview = svg
      this.icon.colorsMap = meta.recolorData.colorsMap
    }
  }
}
</script>

<style lang="scss">
  @import '../../../assets/css/variables';

  .effects-modal {
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    height: 360px;

    &.app-modal {
      padding: 0 !important;
    }

    .effect-sliding-menu {
      order: 0;
      flex: 0 0 180px;
      width: 180px;
      height: 100%;
      background-color: #f4f4f4;
      padding: 0.5rem 0;
      fill: #9B9B9B;
      border-radius: 4px 0 0 4px;
    }

    .effect-sliding-item {
      height: 2.25rem;
      line-height: 2.25rem;
      padding-left: 0.75rem;
      cursor: pointer;
      transition: 0.3s all ease;

      &:hover {
        color: $color-font-dark;
        fill: $color-font-dark;
      }

      &.is-divider {
        height: 1px;
        border-bottom: 1px solid $color-grey;
        margin: 6px 0;
      }

      &.is-active {
        color: white;
        fill: white;
        background-color: $color-blue;
        .icon-effects-svg {
          fill: $color-blue;
        }
      }
    }
    .effect-modal-icon {
      display: inline-block;
      vertical-align: top;
      height: 1.25rem;
      width: 1.25rem;
      margin: 0.5rem 0.75rem 0 0;
      &>svg, &>img {
        width: 100%;
        height: 100%;
        vertical-align: top;
      }
    }
    .effect-sliding-item-toggle {
      float: right;
    }

    .effect-modal-options {
      order: 1;
      flex: 0 0 224px;
      height: 290px;
    }

    .effect-sliding-preview {
      order: 2;
      flex: 0 0 300px;
      width: 300px;
      padding: 1.5rem 1.5rem 0;
      background-color: #bdc3c7;
      box-shadow: inset 3px 1px 2px -2px rgba(0, 0, 0, 0.25);
      border-radius: 0 4px 4px 0;
    }
    .effect-sliding-preview-text {
      margin-bottom: 4px;
      display: inline-block;
      font-size: 14px;
      color: $color-font-dark;
    }
    .effect-sliding-preview-header {
      padding: 0.5rem 0 1.25rem;
      text-align: center;

      &.is-right {
        float: right;
      }
    }
    .effect-sliding-preview-icon {
      display: inline-block;
      width: 2.5rem;
      height: 2.5rem;
      line-height: 2.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

      &>svg {
        width: 100%;
        height: 100%;
      }
    }
    .effect-sliding-preview-canvas {
      margin: 0 auto 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .effect-sliding-preview-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: $color-font-dark
    }

    .effect-options-field {
      min-height: 3rem;
      max-height: 6rem;
      padding: 0 0.75rem;
      color: $color-font-dark;
      border-bottom: 1px solid $color-grey-light;

      &:last-child {
        border-bottom: none;
      }

      &.is-no-padding {
        padding: 0;
      }

      &>input, &>select {
        border: none;
        height: 3rem;
        line-height: 3rem;
        padding: 0;
      }
      &>label {
        margin-top: 0.75rem;
        display: inline-block;
      }
      &>.color-picker {
        float: right;
        margin-top: 11px;
      }
    }
  }

  // transition
  .effect-options-field.effect-option-enter-active,
  .effect-options-field.effect-option-leave-active {
    transition: all 0.5s ease, opacity 0.3s 0.2s ease;
  }
  .effect-options-field.effect-option-enter,
  .effect-options-field.effect-option-leave-to {
    min-height: 0;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.5s ease, opacity 0.3s ease;
  }
</style>
