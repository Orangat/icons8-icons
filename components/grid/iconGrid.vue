<template lang="pug">
  .icon-grid
    app-accordion#app-accordion(
      v-bind:is-active="isAccordionShown"
      ref="accordion"
      v-on:close="closeAccordion"
    )

    // icons and labels styles
    template(v-if="gridStyle !== 'grid'")

      // Icons list
      .set(
        v-if="icons && icons.length"
        v-bind:class="{'is-labels-shown': showLabels}"
      )
        .icon(
          v-ripple
          v-for="(icon, index) in icons"
          v-bind:key="icon.id"
          v-bind:ref="`icon-${icon.id}`"
          v-bind:class="iconClasses(icon)"
        )
          nuxt-link.icon-link(
            v-bind:event="''"
            v-bind:to="getIconUrl(icon)"
            v-on:click.native.stop.prevent.capture="iconAction(icon, index)"
            draggable="false"
            v-on:dragstart.native="anchorDragStart($event, icon)"
            v-on:dragover.native="$event.preventDefault()"
          )
            app-icon(
              v-bind:icon="icon"
              v-bind:lazy="index >= 30"
              v-bind:color="color.value"
              v-bind:alt="getIconAlt(icon)"
            )
            .icon-title(v-if="showLabels") {{ getIconTitle(icon) }}
          .bookmark(v-html="$icons.bookmark" v-on:click="toggleInCollection(icon)")

    // table styles
    template(v-if="gridStyle === 'grid'")

      // Icons list
      .grid(v-if="icons && icons.length")
        .row
          .column.is-name
          .column(v-for="platform in realPlatforms") {{ platform.title }}

        .row(v-for="icon in commonIdIcons")
          .column.is-name {{ icon.name }}
          .column(v-for="platform in realPlatforms")
            .icon(
              v-ripple
              v-if="getPlatformIcon(icon, platform)"
              v-bind:ref="`icon-${getPlatformIcon(icon, platform).id}`"
              v-bind:class="iconClasses(getPlatformIcon(icon, platform))"
            )
              nuxt-link.icon-link(
                v-bind:event="''"
                v-bind:to="getIconUrl(getPlatformIcon(icon, platform))"
                v-on:click.native.stop.prevent.capture="iconAction(getPlatformIcon(icon, platform))"
                draggable="false"
                v-on:dragstart.native="anchorDragStart($event, icon)"
                v-on:dragover.native="$event.preventDefault()"
              )
                app-icon(
                  v-bind:icon="getPlatformIcon(icon, platform)"
                  v-bind:color="color.value"
                  v-bind:alt="getIconAlt(icon)"
                )
              .bookmark(v-html="$icons.bookmark" v-on:click="toggleInCollection(icon)")

            .icon.is-empty(
              v-if="!getPlatformIcon(icon, platform)"
              v-on:click="requestIconModal(icon, platform)"
            )

      app-modal(
        v-bind:name="requestIconModalName"
        v-bind:content-class="'icon-grid-request-icon-modal'"
       )
        template(v-if="!iconRequested")
          h2 Request Icon
          p(v-html="$t('WEB_APP.REQUEST_ADD_MODAL.TITLE')")
          div.info-block
            span.snowflake-pic(v-html="$icons.snowflake")
            span.modal-span(v-html="$t('WEB_APP.REQUEST_ADD_MODAL.CATCH_TITLE')" )
            strong(v-html="$t('WEB_APP.REQUEST_ADD_MODAL.ASK_SHARE')")
            br
            span.info-block-description(v-html="$t('WEB_APP.REQUEST_ADD_MODAL.SHARE_IDEA')")
            .button(
              v-on:click="requestIcon"
              v-bind:class="{'is-loading': requestingIcon}"
            ) {{ $t('REQUEST_ICONS.REQUEST_PAGES.NEXT', 'Next') }}
        template(v-if="iconRequested")
          h2 You Requested Icon!
          p.share-description
            span(v-html="$t('REQUEST_ICONS.SHARE.TITLE')")
          div.info-block
            share-link(v-bind:text="shareText" v-bind:url="shareUrl")
            .button(
              v-on:click="closeRequestModal"
              v-bind:class="{'is-loading': requestingIcon}"
            ) {{ $t('REQUEST_ICONS.I_SHARED') }}
</template>

<script>
import axios from '~/plugins/axios'
import iconUtils from '~/plugins/iconUtils'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'iconGrid',
  props: {
    icons: {
      type: Array,
      'default' () {
        return []
      }
    },
    gridStyle: {
      type: String,
      validator (value) {
        return value === 'icons' || value === 'labels' || value === 'grid'
      },
      'default': 'labels'
    },
    action: {
      type: String,
      'default': 'navigate',
      validator (value) {
        return value === 'navigate' || value === 'select'
      }
    },
    activeGrid: String,
    id: String
  },
  data () {
    return {
      requestedIcon: undefined,
      requestedPlatform: undefined,
      requestingIcon: false,
      iconRequested: false,
      shareText: '',
      shareUrl: '',
      showAccordion: false,
      selectedIconIndex: 0
    }
  },
  computed: {
    ...mapState({
      mode: state => state.ui.mode,
      collection: state => state.collections.collection,
      platforms: state => state.appInfo.platforms,
      locale: state => state.i18n.locale,
      color: state => state.color,
      shape: state => state.shape,
      format: state => state.format,
      selectedIcon: state => state.icon.selectedIcon
    }),
    showLabels () {
      return this.gridStyle === 'labels'
    },
    isIcon () {
      return this.mode === this.$store.state.ui.modes.ICON_MODE
    },
    isCollection () {
      return this.mode === this.$store.state.ui.modes.COLLECTIONS_MODE
    },
    realPlatforms () {
      let realPlatforms = Object.keys(this.platforms)
        .map(platform => this.platforms[platform])
        .filter(platform => platform.apiCode !== 'all')
        .sort((a, b) => {
          return a.order - b.order
        })
      realPlatforms.unshift({
        title: realPlatforms[0].title + ' Filled',
        apiCode: realPlatforms[0].apiCode + 'Filled'
      })
      return realPlatforms
    },
    commonIdIcons () {
      return this.groupByCommonId(this.icons)
    },
    isAccordionShown () {
      return this.showAccordion && this.activeGrid === this.id
    },
    requestIconModalName () {
      const idWithoutSpaces = this.id.replace(/\s+/g, '')
      return `${idWithoutSpaces}icon-grid-request-icon`
    }
  },
  watch: {
    icons () {
      // force component render in case new page icons array have the same length
      this.$forceUpdate()
    }
  },
  mounted () {
    window.addEventListener('resize', this.moveAccordion, false)
  },
  beforeDestroy () {
    window.removeEventListener('drop', this.moveAccordion, false)
  },
  methods: {
    ...mapActions([
      'hideLeftSidebar',
      'selectIcon',
      'unselectIcon',
      'toggleIconInCollection',
      'showRightSidebar',
      'setCollectionsMode',
      'hideEffects',
      'shrinkIcons'
    ]),
    moveAccordion () {
      this.hideEffects()
      const iconRef = this.$refs[`icon-${this.selectedIcon.id}`]
      if (!iconRef || !iconRef[0]) {
        return
      }
      const $icon = iconRef[0]
      const $accordion = this.$refs.accordion.$el
      if (this.gridStyle === 'grid') {
        const $row = $icon.parentNode.parentNode
        $row.parentNode.insertBefore($accordion, $row.nextSibling)
        const rowWidth = Math.max($row.scrollWidth, $row.offsetWidth, $row.clientWidth)
        $accordion.style.width = rowWidth + 'px'
      } else {
        const styleIcon = $icon.currentStyle || window.getComputedStyle($icon)
        const iconWidth = $icon.offsetWidth + parseFloat(styleIcon.marginLeft) + parseFloat(styleIcon.marginRight)
        const iconsInRow = Math.floor($icon.parentNode.offsetWidth / iconWidth)
        let iconRowIndex = (this.selectedIconIndex + 1) % iconsInRow
        if (iconRowIndex === 0) {
          iconRowIndex = iconsInRow
        }
        let lastIconIndex = this.selectedIconIndex + (iconsInRow - iconRowIndex)
        if (lastIconIndex > this.icons.length - 1) {
          lastIconIndex = this.icons.length - 1
        }
        const lastIcon = this.icons[lastIconIndex]
        const $lastIcon = this.$refs[`icon-${lastIcon.id}`][0]
        $lastIcon.parentNode.insertBefore($accordion, $lastIcon.nextSibling)
      }
    },
    openAccordion () {
      this.moveAccordion()
      this.showAccordion = true
      let iconOffset = 152
      if (this.gridStyle === 'icons' || this.gridStyle === 'grid') {
        iconOffset = 112
      }
      setTimeout(() => {
        this.$scrollTo(this.$el.querySelector('#app-accordion'), 500, { offset: -iconOffset })
      }, 200)
      setTimeout(() => {
        this.$emit('activate', this.id)
      })
    },
    closeAccordion () {
      this.unselectIcon()
      this.selectedIconIndex = 0
      this.showAccordion = false
    },
    toggleAccordion (icon, index) {
      if (this.selectedIcon !== icon) {
        this.unselectIcon()
        this.shrinkIcons()
        this.hideLeftSidebar()
        this.selectIcon(icon)
        this.selectedIconIndex = index
        this.openAccordion()
        this.$analytics.page({
          name: 'Product Page',
          url: this.getIconUrl(icon)
        })
      } else {
        this.closeAccordion()
      }
    },
    getIconUrl (icon) {
      return iconUtils.getIconUrl(icon)
    },
    getIconTitle (icon) {
      let title = `${icon.name}`
      if (this.color && this.color.code !== 'black') {
        title = this.color.title + ' ' + title
      }
      return title
    },
    getIconAlt (icon) {
      return this.getIconTitle(icon) + ' icon'
    },
    groupByCommonId (icons) {
      let commonIdIcons = {}
      icons.forEach((icon, index) => {
        const platform = icon.platform + (icon.filled ? 'Filled' : '')
        if (commonIdIcons[icon.commonId]) {
          commonIdIcons[icon.commonId].icons[platform] = icon
        } else {
          commonIdIcons[icon.commonId] = {
            id: icon.commonId,
            order: index,
            icons: {
              [platform]: icon
            },
            name: icon.name
          }
        }
      })
      commonIdIcons = Object.keys(commonIdIcons)
        .map(id => commonIdIcons[id])
        .sort((a, b) => {
          return a.order - b.order
        })
      return commonIdIcons
    },
    getPlatformIcon (commonIdIcon, platform) {
      return commonIdIcon.icons[platform.apiCode]
    },
    iconAction (icon, index) {
      this.$analytics.trackIconClick({
        id: icon.id,
        term: this.$route.params.term
      })
      if (this.action === 'navigate') {
        this.$router.push({
          path: this.getIconUrl(icon)
        })
      } else if (this.action === 'select') {
        this.toggleAccordion(icon, index)
      }
    },
    toggleInCollection (icon) {
      this.$analytics.trackIconClick({
        id: icon.id,
        term: this.$route.params.term
      })
      this.showRightSidebar()
      this.setCollectionsMode()
      this.toggleIconInCollection({ icon })
        .catch(error => {
          console.error(error)
          if (error && error.notify) {
            this.$error({
              title: 'Collection update failed',
              text: error.notify
            })
          }
        })
    },
    iconClasses (icon) {
      const isSelected = this.isIconInCollection(icon)
      return {
        'is-selected': isSelected,
        'is-white': this.color.value === 'ffffff',
        'is-no-labels': !this.showLabels && this.gridStyle !== 'grid',
        'is-active': this.selectedIcon === icon
      }
    },
    isIconInCollection (icon) {
      if (!icon) {
        return true
      }
      let exists = false
      if (Array.isArray(this.collection.icons)) {
        this.collection.icons.some(i => {
          if (i.iconId === icon.id && !icon.user_icon_id) {
            exists = true
            return true
          }
        })
      }
      return exists
    },
    requestIconModal (icon, platform) {
      this.requestedIcon = icon
      this.requestedPlatform = platform
      this.iconRequested = false
      this.$modal.show(this.requestIconModalName)
    },
    requestIcon () {
      this.requestingIcon = true
      const icon = this.requestedIcon.icons[Object.keys(this.requestedIcon.icons)[0]]
      const name = icon.commonName ? this.$utils.prettifyValue(icon.commonName) : icon.name
      const data = new FormData()
      data.append('Idea[title]', name)
      data.append('platform_id[]', this.requestedPlatform.id)
      data.append('commonIconId', this.requestedIcon.id)
      axios.request({
        url: `/idea/create?language=${this.locale}`,
        baseURL: process.env.backendUrl,
        method: 'post',
        data
      })
        .then(response => {
          this.requestingIcon = false
          const idea = response.data.idea
          if (response.data.status === 'success' && idea) {
            this.iconRequested = true
            this.shareText = 'Vote for my icon idea: ' + idea.title
            this.shareUrl = `${process.env.backendUrl}/request-icon/idea/${idea.idea_id}/${this.$utils.normalizeValue(idea.title)}`
          } else {
            console.log('response.data.errors', response.data.errors)
          }
        })
        .catch(error => {
          this.requestingIcon = false
          console.log('error.message', error.message)
        })
    },
    closeRequestModal () {
      this.$modal.hide('icon-grid-request-icon')
    },
    // This is necessary for drag'n'drop to work in firefox
    anchorDragStart (e, icon) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        icon: icon,
        id: icon.id,
        svg: icon.content
      }))
    }
  }
}
</script>

<style lang="scss">
  .icon-grid-request-icon-modal {
    position: relative;

    &.app-modal.icon-grid-request-icon-modal {
      width: 512px;
      padding: 32px 48px 0;
      text-align: left;
      border-radius: 8px;
      font-weight: 400;

      @media (max-width: 45rem) {
        width: 400px;
        padding: 1rem 0 2rem;
      }

      &>h2 {
        font-size: 32px;
        text-align: left;
        margin: 8px 0 5px;
        font-weight: 400;
      }

      &>p {
        margin: 0;
        font-size: 16px;
        font-weight: 400;
        line-height: 24px;
        width: 84%;

        &.share-description {
          margin-bottom: 58px;
        }
      }

      .info-block {
        padding: 24px 48px 48px;
        margin: 32px -48px 0;
        background-color: #f3f3f3;
        font-size: 16px;
        color: #484848;
        line-height: 24px;
        position: relative;
        border-radius: 0 0 8px 8px;

        @media (max-width: 45rem) {
          padding: 1rem;
          margin-bottom: 1rem;
        }
      }

      .button {
        height: 48px;
        width: 136px;
        font-size: 18px;
        line-height: 48px;
        padding: 0;
        font-weight: 300;
        border-radius: 6px;
      }

      .share-link {
        text-align: left;
        margin: 24px -8px 48px;

        .item {
          border-radius: 4px;

          &.is-twitter {
            background-color: #5CBFE5;

            &:hover {
              background-color: #53a9ca;
            }
          }

          &.is-facebook {
            background-color: #5C699D;

            &:hover {
              background-color: #49537d;
            }
          }

          &.is-google {
            background-color: #D55F5D;

            &:hover {
              background-color: #b75351;
            }
          }
        }
      }

      .info-block-description {
        margin-bottom: 20px;
        display: block;
      }

      .snowflake-pic {
        position: absolute;
        top: 27px;
        left: 23px;
        width: 20px;
        height: 20px;
      }

      .m-facebook-color {
        color: #4a90e2;
      }
      .m-twitter-color {
        color: #00c3e4;
      }

      .modal-span {
        font-size: 12px;
        text-transform: uppercase;
        color: rgba(0,0,0,0.3);
        position: relative;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/mixins';

  .icon-grid {
    .grid {
      margin: 0 -8px;
    }

    &.is-loading {
      @include loading;
    }

    .title {
      margin: 0 auto 1rem;
      text-align: left;
      font-size: 12px;
    }

    .set {
      display: flex;
      flex-flow: row wrap;
      margin: 0 -10px;
      justify-content: flex-start;

      &.is-labels-shown {
        .icon {
          width: 112px;
          height: 136px;
          margin: 1px;

          &>.app-icon {
            margin: 8px auto 4px;
          }
        }
        .icon-link {
          height: 136px;
        }
      }
    }

    $icon-width: 112px;
    $icon-height: 96px;
    .icon {
      position: relative;
      display: inline-block;
      width: $icon-width;
      height: $icon-height;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;

      &.is-no-labels {
        margin: 1px;
      }

      &.is-white {
        background: #dadada;
      }

      &.is-active {
        background: #f4f4f4;
        color: black;
      }

      &:hover, &.is-clicked {
        background: #f4f4f4;
        color: black;

        &.is-white {
          background: #d2d2d2;
        }
        .bookmark {
          opacity: 1;
          & > /deep/ svg {
            fill: darken($color-grey, 10%);
          }
        }
      }

      &.is-selected {
        .bookmark {
          opacity: 1;
          & > /deep/ svg {
            fill: $color-red;
          }
        }
      }

      &.is-empty {
        &:before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          margin-left: -10px;
          height: 1px;
          width: 22px;
          border-bottom: 2px solid #d2d2d2;
        }
        &:after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -10px;
          height: 22px;
          width: 1px;
          border-right: 2px solid #d2d2d2;
        }
      }

      .app-icon {
        margin: 16px auto 10px;
      }
    }

    .icon-link {
      display: inline-block;
      width: $icon-width;
      height: $icon-height;
    }

    .bookmark {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 3;
      width: 29px;
      height: 29px;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;
      cursor: pointer;
      opacity: 0;

      & > /deep/ svg {
        width: 100%;
        height: 100%;
        fill: darken($color-grey, 10%);
      }
    }

    .icon-title {
      position: relative;
      text-align: center;
      color: $color-font;
      line-height: 16px;
      max-width: 90%;
      margin: 0 auto;
      font-size: 12px;
      padding-top: 6px;
      max-height: 42px;
      overflow: hidden;
    }

    .row {
      white-space: nowrap;
    }

    .column {
      min-width: 112px;
      max-width: 112px;
      max-height: 96px;
      font-size: 14px;
      text-align: center;
      vertical-align: middle;
      display: inline-block;
      margin: 6px 8px;

      &.is-name {
        text-align: left;
        overflow-x: hidden;
      }
    }

    .bounce-enter-active {
      animation: bounce 0.25s;
    }
    .bounce-leave-active {
      animation: bounce 0.25s reverse;
    }
    @keyframes bounce {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0px);
        opacity: 1;
      }
    }
  }
</style>
