<template lang="pug">
  div
    template(v-if="isPlatforms")
      .list(v-if="submenuItems.length > 0")
        template(v-for="item in items")
          nuxt-link.list-item(
            v-if="item.id !== 'androidL'"
            v-bind:key="item.url"
            v-bind:to="item.url"
            v-html="generateListItem(item.title)"
          )
          app-expand(
            v-else
            v-bind:title="$t('ICON.COMPONENTS.LEFT_SIDEBAR.STYLE_MATERIAL')"
          )
            .list.submenuList
              nuxt-link.list-item.submenuListItem(
                v-for="submenuItem in submenuItems"
                v-bind:key="submenuItem.url"
                v-bind:to="submenuItem.url"
                v-html="submenuItem.title"
              )
      .list(v-else)
          nuxt-link.list-item(
            v-for="item in items"
            v-bind:key="item.url"
            v-bind:to="item.url"
            v-html="generateListItem(item.title)"
          )
    template(v-else)
      .list
        nuxt-link.list-item(
          v-for="item in items"
          v-bind:key="item.url"
          v-bind:to="item.url"
          v-html="item.title"
        )
</template>

<script>
export default {
  name: 'MenuList',
  props: {
    items: {
      type: Array,
      'default': []
    },
    isPlatforms: {
      type: Boolean,
      'default': false
    },
    customTitle: {
      type: Boolean,
      'default': false
    },
    submenuItems: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    generateListItem (title) {
      if (!this.customTitle) {
        return title
      }
      if (title === 'Color') return 'Flat Color'
      else return title
    }
  }
}
</script>
