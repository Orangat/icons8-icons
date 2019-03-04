<template lang="pug">
  .related-icons-wrap
    .related-icons(v-bind:class="{'is-horizontal': isHorizontal}")
      template(v-if="variants")
        .related-icons-icon(
          v-for="relatedIcon in related"
          v-bind:key="relatedIcon.id"
          v-on:click="select(relatedIcon)"
          v-bind:class="{'is-active': current === relatedIcon}"
        )
          app-icon(
            v-bind:icon="relatedIcon"
            v-bind:custom-size="36"
          )
          | {{ relatedIcon.name }}

</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'AccordionRelatedIcons',
  serverCacheKey: props => JSON.stringify(props),
  props: {
    icon: {
      type: Object,
      'default': undefined
    },
    isHorizontal: {
      type: Boolean,
      'default': false
    }
  },
  data () {
    return {
      current: false,
      related: [],
      relatedLoaded: false,
      showRelated: true
    }
  },
  computed: {
    variants () {
      if (this.icon && this.icon.id) {
        return this.getSimilarIcons({ id: this.icon.id })
          .then(response => {
            this.related = response.icons
            return true
          })
          .catch(error => {
            console.error('error', error)
          })
      } else {
        return true
      }
    }
  },
  methods: {
    ...mapActions([
      'getSimilarIcons',
      'getIcon'
    ]),
    select (related) {
      let full = {}
      this.getIcon(related)
        .then(response => {
          full = response.icon
          full.synonim = related.name
          this.$emit('select', full)
        })
        .catch(error => {
          this.$emit('select', related)
          console.log('error', error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';
  @import '../../assets/css/breakpoints';
  @import '../../assets/css/mixins';

  .related-icons-wrap {
    overflow-x: hidden;

    .related-icons {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: $similar-icons-width;
      background-color: #fafafa;
      box-shadow: inset 1px 0 0 0 #ececec;

      &.is-responsive {
        @media (max-width: $responsive-app) {
          position: static;
          width: 100%;
          margin-top: 16px;
          padding-bottom: 4px;
          box-shadow: none;
          text-align: center;

          &>.related-icons-icon {
            display: inline-block;
            padding: 8px 0 0;
            width: $similar-icons-width - 20px;
            height: $similar-icons-width - 20px;
            &.is-active {
              background-color: white;
              border-radius: 6px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            }
          }
        }
      }

      &.is-horizontal {
        position: relative;
        background: none;
        box-shadow: none;
        white-space: nowrap;

        &::-webkit-scrollbar {
          height: 5px;
        }

        & > .related-icons-icon {
          display: inline-block;
          width: 88px;
          height: 88px;
          border-radius: 6px;
          transition: all 0.5s;
          margin-right: 5px;
          overflow: hidden;
          white-space: pre-wrap;

          &.is-active {
            background: rgba(0, 0, 0, 0.05);
            box-shadow: none;
          }

          &:hover {
            background: rgba(0, 0, 0, 0.03);
          }
        }
      }

      &>.related-icons-icon {
        position: relative;
        display: block;
        padding: 23px 0 8px;
        width: $similar-icons-width;
        background: white;
        cursor: pointer;
        text-decoration: none;
        transition: 0.3s all ease;
        text-align: center;
        font-size: 12px;
        color: rgba(0, 0, 0, .5);
        border: none;

        &:hover {
          background-color: #f4f4f4;
        }
        &.is-active {
          background-color: white;
          box-shadow: inset 2px 0 0 0 #1a7cf9, inset 0 -1px 0 0 #ececec, inset 0 1px 0 0 #ececec;
        }
        &.is-loading {
          @include loading($size: 32px);
          &>.app-icon {
            opacity: 0.1;
          }
        }

        .app-icon {
          margin: 0 auto 8px;
          width: 36px;
          height: 36px;
        }
      }
    }
  }
</style>
