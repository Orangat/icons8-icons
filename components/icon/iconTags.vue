<template lang="pug">
  .icon-tags
    .icon-tags-title(v-if="shortTags.length && showTitle") {{$t('WEB_APP.VIEW_ICONS.BROWSE_TAG')}}
    a.tag(
      v-for="tag in shortTags"
      v-bind:key="tag"
      v-bind:href="`/icon/set/${tag ? tag.toLowerCase() : ''}`"
    ) {{ tag }}
    template(v-if="othersTags")
      app-popup(
        ref="othrs-tags-popup"
        position="bottom-right"
        v-bind:show-toggle="false")
          .app-popup-btn
            i
            i
            i
          div(slot="content")
            .icon-tags
              a.tag(
                v-for="otherTag in othersTags"
                v-bind:key="otherTag"
                v-bind:href="`/icon/set/${otherTag ? otherTag.toLowerCase() : ''}`"
              ) {{ otherTag }}
</template>

<script>
export default {
  name: 'IconTags',
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    shortTags () {
      return this.tags ? this.tags.slice(0, 23) : []
    },
    othersTags () {
      return (this.tags.length > 23) ? this.tags.slice(23, 100) : null
    }
  }
}
</script>

<style lang="scss">
  .icon-tags {
    font-size: 15px;
    line-height: 20px;
    .icon-tags-title {
      display: inline-block;
      margin-right: 0.5rem;
    }

    .app-popup {
      display: inline-block;;
    }

    div.app-popup div.app-popup-content {
      width: 30rem;
      padding: 8px 0 0 8px;
      @media (max-width: 1170px) {
        width: 25rem;
        right: 0;
        transform: translateX(50%)
      }
    }

    .app-popup-btn {
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 48px;
      height: 26px;
      margin-bottom: 8px;
      background-color: #f4f4f4;
      border-radius: 5px;
      color: #9b9b9b;
      padding: 0 8px;
      border: 1px solid hsla(0,0%,61%,0);
      text-decoration: none;
      cursor: pointer;
      transition: 0.3s all ease;
      i {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: #000000;
      }
    }
  }

</style>
