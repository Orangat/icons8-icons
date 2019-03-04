<template lang="pug">
  .icon-sidebar
    icon-toolbar(
      :icon="computedIcon"
      :iconSize="192"
      :class="{'is-open': effectsState}"
      @iconEffected="iconEffected"
    )

    icon-workspace-two(:icon="computedIcon")
      div.sidebar-content-icons(v-if="computedIcon.variants")
        app-tabs.is-left.is-accordion
          app-tab(
            v-bind:title="$t('ICON.COMPONENTS.ACCORDION.OTHER_STYLES', {'icon': computedIcon.synonim || computedIcon.name})"
            v-bind:active="true"
            v-if="computedIcon.variants.length > 1"
          )
            div.show-more(v-if="iconsShrinked && isSimilarOverflown()" v-on:click="expandIcons")
              .show-more-icon(v-html="$icons.more")
              span {{ $t('ICON.COMPONENTS.ACCORDION.MORE') }}
            similar-icons(
              :icon="computedIcon"
              :is-icon-loading="!computedIcon.id"
              :navigate="false"
              :is-horizontal="true"
              :class="{'is-expanded': !iconsShrinked}"
              @select="select"
            )
          app-tab(
            v-bind:title="`${$t('ICON.COMPONENTS.ACCORDION.RELATED')} ${computedIcon.synonim || computedIcon.name}`"
            v-if="computedIcon.variants.length > 1"
          )
            p.show-more(v-if="iconsShrinked && isRelatedOverflown()" v-on:click="expandIcons") {{ $t('ICON.COMPONENTS.ACCORDION.SHOW_MORE') }}
            accordion-related-icons(
              :icon="computedIcon"
              :is-horizontal="true"
              @select="select"
              :class="{'is-expanded': !iconsShrinked}"
            )
</template>

<script>
import iconUtils from '~/plugins/iconUtils'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'IconSidebar',
  data () {
    return {
      sidebar: undefined,
      similar: undefined,
      related: undefined
    }
  },
  computed: {
    ...mapState({
      icon: state => state.icon.selectedIcon,
      fullIcon: state => state.icon.fullIcon,
      effectsState: state => state.ui.effects.active,
      iconsShrinked: state => state.ui.accordion.shrinked
    }),
    computedIcon () {
      return this.fullIcon.id ? this.fullIcon : this.icon
    }
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.$forceUpdate()
    }, false)
    this.sidebar = this.$el.querySelector('.app-right-sidebar-content')
    if (!this.sidebar) {
      return
    }
    this.sidebar.addEventListener('dragover', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.sidebar.classList.add('is-drag-over')
      e.dataTransfer.dropEffect = 'copy'
    }, false)
    this.sidebar.addEventListener('dragenter', (e) => {
      e.stopPropagation()
      e.preventDefault()
      this.sidebar.classList.add('is-drag-over')
    }, false)
    this.sidebar.addEventListener('dragleave', (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (!this.sidebar.contains(e.fromElement)) {
        this.sidebar.classList.remove('is-drag-over')
      }
    }, false)

    this.sidebar.addEventListener('drop', this.handleDrop, false)
  },
  beforeDestroy () {
    if (this.sidebar) {
      this.sidebar.removeEventListener('drop', this.handleDrop, false)
    }
  },
  updated () {
    this.similar = this.$el.querySelector('.similar-icons-wrap')
    this.related = this.$el.querySelector('.related-icons-wrap')
  },
  methods: {
    ...mapActions([
      'selectIcon',
      'uploadIcons',
      'extendFullIcon',
      'expandIcons'
    ]),
    isSimilarOverflown () {
      // Checking if similar icons overflown on users screen
      if (this.similar) {
        return this.similar.scrollWidth > this.similar.clientWidth
      }
      return false
    },
    isRelatedOverflown () {
      // Checking if related icons overflown on users screen
      if (this.related) {
        return this.related.scrollWidth > this.related.clientWidth
      }
      return false
    },
    iconEffected (svgEffect) {
      this.extendFullIcon({ svgEffect })
    },
    select (variant) {
      this.extendFullIcon(Object.assign(
        { svgEffect: false, svgCurrentResolution: false },
        variant,
        { variants: this.fullIcon.variants }
      ))
    },
    handleDrop (e) {
      e.stopPropagation()
      e.preventDefault()
      this.sidebar.classList.remove('is-drag-over')

      let data = e.dataTransfer.getData('text')
      if (data) {
        try {
          data = JSON.parse(data)
          const icon = data.icon
          if (icon) {
            this.selectIcon(icon)
            this.$analytics.trackIconClick({
              id: icon.id,
              term: this.$route.params.term
            })
            this.$analytics.page({
              name: 'Product Page',
              url: iconUtils.getIconUrl(icon)
            })
          }
        } catch (e) {
          console.log('DnD data error', e)
        }
      }
      if (e.dataTransfer.files.length) {
        this.uploadIcons([e.dataTransfer.files[0]])
          .then(icons => {
            const icon = icons[0]
            this.selectIcon(icon)
          })
          .catch(error => {
            console.log('error', error)
          })
        this.$analytics.track({
          event: 'Uploaded own SVG',
          category: 'Downloads'
        })
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../assets/css/variables';
  @import '../../../assets/css/mixins';

  .grid .app-left-sidebar-content {
    width: 3%;
  }

  .icon-sidebar {
    display: flex;
    font-size: 15px;
    margin: 0 -30px;
    background-color: #F1F1F1;

    @media (max-width: 768px) {
      margin: 0 auto 0;
    }

    @media (max-width: 570px) {
      max-height: none;
    }
  }

  .title {
    font-weight: 500;
  }

  .icon-toolbar {
    flex: 0 0 165px;
    padding: $accordion-padding - 5px $effects-spacer $accordion-padding $accordion-padding;
    transition: all .3s;

    @media (max-width: $icon-workspace-effect-titles) {
      flex: 0 0 75px;
    }

    &.is-open {
      $width: $effects-width + $accordion-padding + $effects-spacer;
      flex: 0 0 $width;
      width: $width;
    }
  }

  .icon-workspace {
    flex: 1;
    padding: $accordion-padding 0 0 0;
    transition: all .3s;
  }

  .sidebar-content-icons {
    transition: all .3s;
    .app-tabs-content {
      display: inline-block;
      width: 100%;
    }
    .show-more {
      display: inline;
      width: 88px;
      height: 88px;
      line-height: 88px;
      text-align: center;
      font-size: 14px;
      color: rgba(0, 0, 0, .5);
      background: white;
      cursor: pointer;
      transition: 0.3s all ease;
      float: right;
      margin: 0 5px;
      &:hover {
        background-color: #f4f4f4;
      }
    }
    .show-more-icon {
      width: 30px;
      height: 30px;
      margin: 0 auto;
      position: relative;
      top: 7px;

      & > svg {
        width: 100%;
        height: 100%;
      }
    }
    .similar-icons-wrap {
      &.is-expanded > /deep/ .similar-icons {
        width: 100%;
        white-space: initial;
      }
    }
    .is-accordion > /deep/ .app-tabs-header {
      flex-wrap: nowrap;
    }
  }
</style>
