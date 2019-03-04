<template lang="pug">
  .download-collection-selector
    download-selector(
      popup-position="bottom-center"
      v-bind:icons="collection.icons"
      v-bind:multi-size="false"
    )
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DownloadCollectionSelector',
  computed: {
    ...mapState({
      collection: state => state.collections.collection
    })
  }
}
</script>
