<template lang="pug">
  .icon-page
    //- icon-editor
    .app-page-section.is-header
      icon-editor(v-bind:titleIcon="title")
      .app-page-content
        app-native-ads

    //- similar & related
    .app-page-section
      .app-page-content.is-large
        .h2.is-small.similar-title  {{$t('ICON.COMPONENTS.ACCORDION.OTHER_STYLES', {'icon': icon.name})}}
        similar-icons.is-responsive(
          v-if="icon"
          v-bind:icon="icon"
          v-bind:is-horizontal="true"
          v-bind:navigate="false"
          v-on:select="selectVariant"
          )

      .app-page-content
        h2.is-small.related-title {{ relatedTitle }}
        template(v-if="relatedDescription")
          .app-page-subtitle.is-left(v-html="relatedDescription")

      .app-page-content.is-large
        related-icons(v-bind:icon="icon")
        icon-tags(
          v-if="icon.tags"
          v-bind:tags="icon.tags"
          v-bind:show-title="true")

      //- Idea of {name} icon by {author}
      .app-page-content
        template(v-if="icon.transcription")
          .h2 {{ requestTitle }}
          .app-page-subtitle.is-big.is-left(v-html="icon.transcription")
        .app-page-subtitle.is-left(v-html="description")

    .app-page-section(v-if="icon.request")
      .app-page-content
        .icon-request
          h2 {{ requestTitle }}&nbsp;
            span {{ requestAuthor }}
          .app-page-subtitle {{ requestDates }}
          br
          p(v-html="icon.request.text")
          .request-comments(v-for="comment in icon.request.comments")
            .comment-author
              .comment-icon(v-html="$icons.comment")
              | {{ comment.author }}
            .comment-text(v-html="comment.text")

    //- story about {name} icon
    .app-page-section.is-fixed(v-if="icon.story")
      .app-page-content
        .icon-story
          h2 {{ storyTitle }}
          div(v-html="icon.story.text")
      a.story-author(v-if="icon.story.authorLink" v-bind:href="icon.story.authorLink")
        .app-page-content
          img.author-image(v-bind:src="icon.story.authorPhoto")
          span.author-name  {{ icon.story.authorName }}
      .story-author(v-else)
        .app-page-content
          img.author-image(v-bind:src="icon.story.authorPhoto")
          span.author-name  {{ icon.story.authorName }}

    //- usage story about {name} icon
    .app-page-section.is-underline.is-fixed(v-if="icon.usageStory")
      .icon-page-story(v-html="icon.usageStory")

    //- comments
    .app-page-section.is-underline.is-fixed
      app-comments(v-bind:id="pageId")
</template>

<script>
import moment from 'moment'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'IconPage',
  layout: 'app-landing',
  scrollToTop: true,
  asyncData ({ app, params, store, redirect, res, error }) {
    let id = params.id
    let name = params.name
    return store.dispatch('getIcon', { id, info: true })
      .then(response => {
        const icon = response.icon
        store.dispatch('setPlatform', icon.platform)

        const name = icon.translations ? icon.translations[store.state.i18n.locale] : icon.name
        const encodedName = app.$utils.normalizeValue(name)
        const platform = store.state.appInfo.platforms[icon.platform]
        const platformTitle = platform ? platform.title : 'iOS'
        let canonical = `${store.state.appInfo.backendUrl}/icon/${icon.mainId}/${encodedName}`
        store.dispatch('updateSEO', {
          title: app.$t('WEB_APP.SEO.CATEGORY.ICON_TITLE', { name: icon.name }),
          description: app.$t('WEB_APP.SEO.CATEGORY.ICON_DESCRIPTION_PLATFORM', { name: icon.name, platform: platformTitle }),
          canonical,
          twitterImage: response.icon.shareTwitter,
          googleImage: response.icon.shareGoogle
        })
        if (icon.translations) {
          app.head.link = app.head.link || []
          store.state.appInfo.activeLanguages.forEach(lang => {
            app.head.link.forEach(link => {
              if (link.hreflang === lang.code) {
                const name = app.$utils.normalizeValue(icon.translations[lang.locale])
                link.href = `${lang.url}/icon/${icon.id}/${name}`
              }
            })
          })
        }
        return {
          icon
        }
      })
      .catch(response => {
        if (response.idea) {
          if (process.server) {
            res.setHeader('Location', encodeURI(response.idea))
          } else {
            window.location = response.idea
          }
          error({ statusCode: 302, message: `Redirecting to ${response.idea}` })
          return
        }
        console.log(response)
        // redirect(`/icon/set/${encodeURI(name)}/all`)
        return {
          error: {
            message: response.message
          }
        }
      })
  },
  data () {
    return {
      icon: {
        id: 20825,
        name: 'Icon8 Logo'
      }
    }
  },
  computed: {
    ...mapState({
      appInfo: state => state.appInfo,
      packs: state => state.appInfo.packs,
      lang: state => state.i18n.locale,
      platforms: state => state.appInfo.platforms,
      platform: state => state.platform
    }),
    pageId () {
      return `icon/${this.$route.params.id}`
    },
    alt () {
      return this.icon.name + ' icon' + (this.icon.transcription ? '. ' + this.icon.transcription : '')
    },
    title () {
      return `<h1>` + this.$t(`WEB_APP.VIEW_ICONS.TITLE.${this.icon.platform}`,
        { name: this.icon.name },
        this.$t('WEB_APP.VIEW_ICONS.TITLE.win10', { name: this.icon.name })) + `</h1>`
    },
    description () {
      const params = {
        name: this.icon.name,
        icons: this.icon.name,
        iconsCount: this.appInfo.iconsCount,
        iconsCountsIos7: this.appInfo.iconsCounts.ios7,
        iconsCountsWin8: this.appInfo.iconsCounts.win8,
        iconsCountsWin10: this.appInfo.iconsCounts.win10,
        iconsCountsDotty: this.appInfo.iconsCounts.dotty,
        iconsCountsColor: this.appInfo.iconsCounts.color,
        iconsCountsNolan: this.appInfo.iconsCounts.nolan,
        iconsCountsOffice: this.appInfo.iconsCounts.office,
        iconsCountsAndroid: this.appInfo.iconsCounts.android,
        iconsCountsAndroidL: this.appInfo.iconsCounts.androidL
      }
      let description = this.icon.description
      if (!description) {
        description = this.$t(`WEB_APP.VIEW_ICONS.DESCRIPTION_PLATFORM.${this.icon.platform}`, params, '')
      }
      if (!description) {
        description = this.$t(`WEB_APP.VIEW_ICONS.RANDOM_DESCRIPTION.${parseInt(this.icon.commonId) % 5}`, params,
          this.$t(`WEB_APP.VIEW_ICONS.RANDOM_DESCRIPTION.0`, params))
      }
      return description
    },
    relatedTitle () {
      return this.$t('WEB_APP.VIEW_ICONS.RELATED_TITLE', { name: this.icon.name })
    },
    relatedDescription () {
      const pack = this.packs.find(pack => pack.name[this.lang] === this.icon.category)
      return this.$t('WEB_APP.VIEW_ICONS.RELATED_TEXT', {
        url: this.appInfo.backendUrl,
        category: pack ? pack.code : 'free-icons',
        categoryLowercase: ('' + this.icon.category).toLocaleLowerCase()
      })
    },
    requestTitle () {
      return this.$t('WEB_APP.VIEW_ICONS.IDEA_TITLE', { name: this.icon.name })
    },
    requestAuthor () {
      if (this.icon.request.author) {
        return this.$t('WEB_APP.VIEW_ICONS.IDEA_AUTHOR', { author: this.icon.request.author })
      }
      return null
    },
    requestDates () {
      const subtitle = this.$t('WEB_APP.VIEW_ICONS.IDEA_SUBTITLE')
      const created = moment(this.icon.request.created * 1000).format('MMMM DD, YYYY')
      const and = this.$t('WEB_APP.VIEW_ICONS.IDEA_AND_CREATED')
      const completed = moment(this.icon.request.completed * 1000).format('MMMM DD, YYYY')
      return `${subtitle} ${created} ${and} ${completed}`
    },
    storyTitle () {
      return this.$t('WEB_APP.VIEW_ICONS.STORY_TITLE', { name: this.icon.name })
    }
  },
  mounted () {
    this.$analytics.track({
      event: 'Viewed Product',
      category: 'Navigation'
    })
    this.$analytics.page({
      name: 'Product Page'
    })
    if (this.error) {
      console.log('this.error', this.error)
    }
    this.setIcon(this.icon)
  },
  methods: {
    ...mapActions([
      'hideLeftSidebar',
      'selectIcon',
      'extendFullIcon',
      'unselectIcon',
      'toggleIconInCollection',
      'showRightSidebar',
      'setCollectionsMode',
      'hideEffects',
      'shrinkIcons',
      'getIcon'
    ]),
    setIcon (icon) {
      this.unselectIcon()
      this.shrinkIcons()
      this.hideLeftSidebar()
      this.selectIcon(icon)
    },
    selectVariant (variant) {
      this.getIcon({ id: variant.id, info: true }).then(response => {
        this.icon = response.icon
        this.extendFullIcon(Object.assign(
          { svgEffect: false, svgCurrentResolution: false },
          variant
        ))
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../../../assets/css/variables';
  @import '../../../../assets/css/breakpoints';

  .icon-page {
    position: relative;
    h1 {
      margin-bottom: 16px;
      font-size: 32px;
      line-height: 48px;
      font-weight: 700;
      text-align: left;
    }

    h2,
    .h2,
    /deep/ h2 {
      font-size: 32px;
      line-height: 36px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-align: left;
      margin: 0 0 30px;
      &.is-small {
        margin: 9px 0 15px;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
      }
    }

    h3,
    .h3,
    /deep/ h3 {
      margin: 9px 0 15px;
      font-size: 24px;
      font-weight: 700;
      line-height: 32px;
    }

    .app-page-subtitle {
      margin: 0;
      font-size: 18px;
      line-height: 32px;
      color: #000000;
      &.is-big {
        font-size: 24px;
        line-height: 32px;
        font-weight: bold;
        letter-spacing: 0.1px;
        margin-bottom: 40px;
      }
    }

    .app-page-section {
      &.is-header {
        padding: 0;
        @media (max-width: 997px) {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      }

      & /deep/ .app-native-ads .horizontal {
        margin-top: 10px;
      }
    }

    .app-page-content {
      max-width: 650px;
      margin: 0 auto 0 150px;
      @media (max-width: 1150px) {
        margin-left: auto;
      }
      &.is-large {
        max-width: 1050px;
      }
    }

    .icon-page-story {
      margin: 0 auto;
      font-size: 18px;
      max-width: 800px;
    }

    .related-icons {
      margin: 10px 0 25px;
    }

    .icon-tags {
      margin-bottom: 40px;
      /deep/ .icon-tags-title {
        @extend .h2;
        @extend .h2.is-small;
        display: block;
        margin-bottom: 23px;
      }
      /deep/ .tag {
        height: 32px;
        border-radius: 16px;
        background-color: #F6F6F6;
        color: #8C8C8E;
        line-height: 26px;
      }
    }

    .icon-request {
      margin: 0 auto;
      font-size: 18px;
      max-width: 800px;
    }

    .icon-story {
      margin: 0 auto;
      font-size: 18px;
      line-height: 32px;
      & /deep/ img {
        max-width: 100%;
        height: auto !important;
        @media (max-width: 997px) {
          height: auto;
        }
      }
    }

    .story-author {
      display: block;
      padding: 23px;
      margin: 2rem -2.3rem 0;
      background: #F6F6F6;
      & .app-page-content {
        display: flex;
        align-items: center;
      }

      .author-image {
        width: 54px;
        height: 54px;
        border-radius: 25px;
        vertical-align: bottom;
        margin-right: 15px;
        transition: all .35s ease-out;
      }
      .author-name {
        font-size: 18px;
        line-height: 24px;
        font-weight: 700;
        color: #474747;
      }
    }

    .request-comments {
      margin-top: 2.5rem;

      .comment-author {
        color: #9b9b9b;
        padding-left: 24px;
        position: relative;
      }

      .comment-icon {
        position: absolute;
        left: 0;
        width: 16px;
        &>svg {
          width: 100%;
          fill: currentColor;
        }
      }

      .comment-text {
        padding-left: 24px;
        margin-bottom: 2.5rem;
        &:last-child {
          margin-bottom: 1rem;
        }
      }
    }

    .app-comments {
      max-width: 800px;
      margin: 0 auto;
    }

    // icon-sidebar --- --- ---

    & /deep/ .download-icon .actions .button {
      margin: 6px 8px 0 0;
    }

    // similar-icons -----------------------
    & /deep/ .similar-icons {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      @media (max-width: 420px) {
        justify-content: center;
      }
      .app-icon.is-custom-size svg {
        height: 28px;
        width: auto;
      }
      &.is-horizontal > .similar-icons-icon {
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
        height: 96px;
        border-radius: 6px;
        padding: 8px;
        margin: 0 40px 6px 0;
        white-space: normal;
        font-size: 12px;
        line-height: 16px;
        color: rgba(#000000, .7);
        @media (max-width: 420px) {
          margin: 0 10px 6px;
        }
        span {
          height: 32px;
          overflow: hidden;
        }
        &:hover,
        &.is-active {
          background-color: #F6F6F6;
        }
      }
    }

  }
</style>
