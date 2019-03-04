<template lang="pug">
  .effects-sliding
    .effects-menu(v-bind:class="{'is-inactive': !editorLoaded}")
      .item.select-effect(
        v-for="effect in singleEffects"
        v-on:click.self="selectEffect(effect)"
        v-bind:class="{'is-active': effect === currentEffect}"
      )
        .item-icon(
          v-html="$icons['effects/' + effect.icon] || effect.icon"
          @click.self="selectEffect(effect)"
        )
        .item-text(
          v-html="$t(effect.name, effect.id)"
          @click.self="selectEffect(effect)"
        )
        .item-toggle
          input.switch.is-mini(
          type="checkbox"
          :id="'icon-effect-' + effect.id"
          v-model="effect.isActive"
          @change="toggleEffect(effect)"
        )
          label(:for="'icon-effect-' + effect.id")
      //- ----------------
      .item.select-effect.is-divider
      .item.select-effect.is-no-effect(
        :class="{'is-show': editorLoaded}"
        @click="toggleReplaceableEffects"
      )
        .item-text {{ $t(noEffects.name)}}
        .item-toggle
          input.switch.is-mini(
          type="checkbox"
          name="replaceable_show"
          :value="noEffects.id"
          v-model="noEffects.state"
        )
          label(:for="'icon-effect-' + noEffects.id")
      //- ----------------
      .item.select-effect(
          v-for="effect in replaceableEffects"
          @click="selectEffect(effect)"
          :class="{'is-active': effect === currentEffect}"
      )
        .item-icon(v-html="$icons['effects/' + effect.icon] || effect.icon")
        .item-text(v-html="$t(effect.name, effect.id)")
        .item-toggle(v-if="noEffects.state")
          input.radio.is-mini(
            type="radio"
            name="replaceable"
            v-model="selectedReplaceable"
            v-bind:value="effect.id"
            v-bind:id="'icon-effect-' + effect.id"
          )
          label.radio-label(v-bind:for="'icon-effect-' + effect.id")

    // selected effect option
    .effect-modal-options(v-bind:class="{'is-loading': !editorLoaded, 'is-disabled': !currentEffect.isActive}")
      keep-alive
        component(v-if="currentEffect.id && currentEffect.id !== noEffects.id" v-bind:is="currentOptions" v-bind="{icon: icon, platform: platform}")
      // Cancel or keep effects
      .controller-effects
        .button.is-small(
          v-bind:class="{'is-inactive': !editorLoaded}"
          v-on:click="saveEffects"
        ) {{ $t('ICON.COMPONENTS.EFFECTS.DONE') }}
        .wrap-cancel(v-on:click.prevent="cancel()")
          a.cancel-button {{ $t('ICON.COMPONENTS.EFFECTS.CANCEL') }}

    // effects preview
    .effect-sliding-preview
      transition(name="fade")
        canvas.effect-sliding-preview-canvas(:width="iconSize" :height="iconSize" hidpi="off")

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

import { mapState, mapActions } from 'vuex'

export default {
  name: 'EffectsSliding',
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
      'default': {}
    },
    isEffectOpened: {
      type: Boolean,
      'default': false
    },
    iconSize: {
      type: Number,
      'default': 192
    }
  },
  data () {
    return {
      canvas: null,
      effects: effectsService.effects,
      currentEffect: effectsService.currentEffect,
      noEffects: {
        id: 'noEffects',
        name: 'WEB_APP.EFFECT.ADD_EFFECT.TITLE',
        state: false
      },
      selectedReplaceable: '',
      showPreview: null,
      editorLoaded: false
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms
    }),
    platform () {
      return this.platforms[this.icon.platform] || { isColor: true }
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
  watch: {
    'icon.id' () {
      this.offAllEfects()
      const effect = this.effects['recolor'].id // OR this.currentEffect.id
      this.initEditor(effect)
    }
  },
  destroyed () {
    effectsService.offRender(this.onRender)
  },
  methods: {
    ...mapActions(
      ['changeColorsMap']),
    initEditor (effectId) {
      const effect = this.effects[('' + effectId).toLowerCase()]
      this.canvas = this.$el.querySelector('.effect-sliding-preview-canvas')
      effectsService.initEditor(this.canvas)
        .then(() => {
          this.currentEffect = effect
          this.selectedReplaceable = effect.id
        })
        .then(this.initIcon)
        .then(() => {
          this.editorLoaded = true
          this.selectEffect(effect)
        })
        .catch(error => {
          console.error(error)
        })
    },
    initIcon () {
      effectsService.initIcon(this.icon, this.platform, this.$store.state.icon.color, this.currentEffect)
    },
    selectEffect (effect) {
      effectsService.selectEffect(effect.id)
      this.currentEffect = effect
      if (effect.type === 'replaceable') {
        this.noEffects.state = true
        this.selectedReplaceable = effect.id
      }
    },
    toggleEffect (effect) {
      if (effect.isActive) {
        effectsService.selectEffect(effect.id)
        this.currentEffect = effect
        if (effect.type === 'replaceable') {
          this.selectedReplaceable = effect.id
        }
      } else {
        effectsService.disableEffect(effect.id)
      }
    },
    toggleReplaceableEffects () {
      this.noEffects.state = !this.noEffects.state
      if (!this.noEffects.state) {
        this.removeReplaceableEffects()
      }
    },
    saveEffects () {
      if (effectsService.saveEffects()) {
        this.$emit('iconEffected', effectsService.resultSvg)
      } else {
        this.$emit('iconEffected', undefined)
      }
      this.$emit('hide')
    },
    cancel () {
      this.offAllEfects()
      this.currentEffect = {}
      this.$emit('hide')
    },
    offAllEfects () {
      Object.keys(this.effects).forEach(key => {
        this.effects[key].isActive = false
        this.effects[key].enabled = false
        if (this.effects[key].destroy) {
          this.effects[key].destroy()
        }
      })
    },
    removeReplaceableEffects () {
      effectsService.removeReplaceableEffects()
      this.selectedReplaceable = this.noEffects.id
      if (this.currentEffect.type === 'replaceable') {
        // this.currentEffect = {}
        this.selectEffect(this.effects['recolor'])
      }
    },
    onRender (svg, meta) {
      this.$emit('iconEffected', svg)
      this.changeColorsMap(meta.recolorData.colorsMap)
    }
  }
}
</script>

<style lang="scss">
  @import '../../../assets/css/variables';
  @import '../../../assets/css/mixins';
  @import './effects-menu';

  .effects-sliding {
    position: relative;
    display: flex;

    @media (max-width: 600px) {
      display: none;
    }

    div.color-picker {
      width: 38px;
    }
    .color-picker-toggle {
      width: 20px;
      height: 20px;
      top: 6px;
      margin-left: 8px;
    }

    .cancel-button {
      z-index: 1;
      font-size: 14px;
      font-weight: 600;
      color: #8C8C8E;
      display: inline-block;
    }

    // .cancel-icon {
    //   width: 17px;
    //   height: 17px;
    //   display: inline-block;
    //   position: relative;
    //   top: 3px;
    //   cursor: pointer;
    //   margin-right: 4px;
    // }
  }

  .effect-modal-options {
    position: relative;
    order: 1;
    flex: 0 0 $effect-options-width;
    padding: 0 15px;
    transition: filter .3s, opacity .4s;

    &.is-loading {
      @include loading($color: #5ca3fd);
    }
    &.is-disabled {
      opacity: 0.8;
    }
  }

  .effect-sliding-preview {
    position: absolute;
    left: 100%;
    width: 224px;
    height: 224px;
    z-index: 2;
    margin-left: 35px;
    margin-top: 5px;
  }
  .effect-sliding-preview-canvas {
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 16px 48px 0 rgba(0,0,0,0.1);
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
  .controller-effects {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $color-font-dark;
    margin: 15px 0 10px;

    .button {
      background: #5CA3FD;
      border-color: #5CA3FD;
      font-size: 14px;
      font-weight: 600;

      &.is-inactive {
        pointer-events: none;
      }
    }
  }

  .effect-options-field {
    padding-bottom: 15px;
    color: $color-font-dark;

    &.is-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &.color-option {
      padding-bottom: 15px;
    }

    &.text-options {
      padding-bottom: 3px;
    }

    &:last-child {
      border-bottom: none;
      margin-bottom: 10px;
    }
    .range-slider {
      input {
        order: 1;
      }
      .range-slider-content {
        margin-right: 15px;
      }
    }
    .range-slider-content {
      width: 102px;
      margin: 6px 0 0 0;
    }

    &.is-no-padding {
      padding: 0;
    }

    &.is-bottom-border {
      border-bottom: 1px solid rgba(0,0,0, .05);
      margin-bottom: 20px;
    }

    &>input, &>select, &>textarea {
      border: none;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      font-weight: 600;
      padding: 0 16px;
      width: 100%;
    }

    &>textarea {
      max-width: 215px;
      max-height: 300px;
    }

    &>label {
      display: inline-block;
      line-height: 16px;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .fill-wrap {
    float: right;
    margin-top: 2px;
    width: 59px;

    & > label {
      font-size: 14px;
      font-weight: 600;
    }

    & > label.fill-label {
      padding-left: 0;
      top: 0;
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

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */ {
    opacity: 0;
  }
</style>
