<template lang="pug">
  .effects-menu(v-bind:class="{'is-progress': !this.icon.svg}")
    effects-sliding(
      ref="effectsSliding"
      v-if="isEffectsShown && effectsState"
      :icon="icon"
      :iconSize="iconSize"
      @iconEffected="iconEffected"
      @hide="hideEffectsSlide"
    )
    template(v-if="!(isEffectsShown && effectsState)")
      .item.init-effects(
        v-for="effect in singleEffects"
        @click="showEffectsSlide(effect.id)"
        :class="effectClasses(effect)"
      )
        .item-icon(v-html="$icons['effects/' + effect.icon] || effect.icon")
        .item-text {{ $t(effect.name) }}
      .item.is-divider(v-if="!(isEffectsShown && effectsState)")
      .item.select-effect.is-no-effect(
        :class="{'is-show': isEffectsShown}")
      .item.init-effects(
        v-for="effect in replaceableEffects"
        @click="showEffectsSlide(effect.id)"
        :class="effectClasses(effect)"
      )
        .item-icon(v-html="$icons['effects/' + effect.icon]")
        .item-text {{ $t(effect.name) }}
</template>

<script>
import effectsService from './effects/effectsService'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'IconEffects',
  props: {
    icon: {
      type: Object,
      'default': {}
    },
    iconSize: {
      type: Number,
      'default': 192
    }
  },
  data () {
    return {
      effects: effectsService.effects,
      isEffectsShown: false
    }
  },
  computed: {
    ...mapState({
      platforms: state => state.appInfo.platforms,
      effectsState: state => state.ui.effects.active
    }),
    singleEffects () {
      return Object.keys(this.effects)
        .filter(key => this.effects[key].type === 'single')
        .map(key => this.effects[key])
    },
    replaceableEffects () {
      return Object.keys(this.effects)
        .filter(key => this.effects[key].type === 'replaceable')
        .map(key => this.effects[key])
    }
  },
  methods: {
    ...mapActions([
      'showEffects',
      'hideEffects',
      'showLeftSidebar',
      'hideLeftSidebar'
    ]),
    effectClasses (effect) {
      return {
        [effect.id]: effect.id
      }
    },
    iconEffected (svg) {
      this.$emit('iconEffected', svg)
    },
    showEffectsSlide (effectId) {
      if (!this.icon.svg) {
        return
      }
      this.isEffectsShown = true
      this.hideLeftSidebar()
      this.showEffects(effectId)
      this.$nextTick(() => {
        this.$refs.effectsSliding.initEditor(effectId)
      })
    },
    hideEffectsSlide () {
      this.showLeftSidebar()
      this.hideEffects()
      setTimeout(() => {
        this.isEffectsShown = false
      }, 100)
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './effects-menu';
</style>
