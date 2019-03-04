<template lang="pug">
  .attributes-filter
    .item
      //.title Color
      div
        nuxt-link.color(
          v-for="color in colorList"
          v-bind:key="color.url"
          v-bind:to="color.url"
          v-bind:class="`is-${color.code}`"
        )
    //.item
      .title Shape
      .shape.is-round Round
      .shape.is-circle Circle Icon
      .shape.is-square Square
    //.item
      .title Format

      .actions.button-group
        .button.is-small.is-blue(
          v-ripple
        ) PNG
        .button.is-small.is-white(
          v-ripple
        ) Vector
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'attributesFilter',
    computed: {
      ...mapState({
        colors: state => state.appInfo.colors,
        shapes: state => state.appInfo.shapes,
        formats: state => state.appInfo.formats,
        platform: state => state.platform,
        color: state => state.color,
        shape: state => state.shape,
        format: state => state.format,
        pack: state => state.pack,
        seoPack: state => state.seoPack
      }),
      colorList () {
        return Object.keys(this.colors).map(color => {
          let url
          let route = this.$route.name
          let params = this.$route.params
          const options = this.getOptions(color)

          if (route === 'icon-new-icons-platform') {
            url = `/icon/new-icons/${options}`

            // if it's pack page or landing, then link to this pack
          } else if (params.pack !== undefined) {
            let packCode = this.pack.code
            url = `/icon/pack/${packCode}/${options}`

            // if it's pack page or landing, then link to this pack
          } else if (params.seoPack !== undefined) {
            let seoPackCode = this.seoPack ? this.seoPack.code : params.seoPack
            url = `/icon/free-pack/${seoPackCode}/${options}`

            // if it's search page or landing, then link to this search
          } else if (params.term !== undefined) {
            url = `/icon/set/${params.term}/${options}`

            // else link to new-icons
          } else {
            url = `/icon/new-icons/${options}`
          }
          return {
            ...this.colors[color],
            url
          }
        })
      }
    },
    methods: {
      getOptions (color) {
        let options = this.platform.seoCode
        if (color !== 'black') {
          options += '--' + color
        }
        if (this.shape) {
          options += '--' + this.shape.code
        }
        if (this.format) {
          options += '--' + this.format.code
        }
        return options
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../assets/css/variables';

  .attributes-filter {
    padding: 0 8px 0 32px;

    .item {
      margin-bottom: 20px;
    }
    .title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: 500;
      color: black;
    }

    .color {
      display: inline-block;
      width: 20px;
      height: 20px;
      margin: 0.25rem 0.5rem 0 0;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0,0,0,0.15);
      transition: 0.4s all ease;

      &:hover, &.is-active {
        box-shadow: 0 0 0 3px $color-blue;
      }

      $hover: 14%;
      $red: #fa314a;
      $blue: #4a90e2;
      $green: #26e07f;
      &.is-white {
        background-color: white;
        box-shadow: 0 0 0 1px darken(white, $hover);
        &:hover, &.is-active {
          box-shadow: 0 0 0 3px darken(white, $hover+4%);
        }
      }
      &.is-black {
        background-color: black;
        box-shadow: 0 0 0 1px black;
        &:hover, &.is-active {
          box-shadow: 0 0 0 3px lighten(black, 40%);
        }
      }
      &.is-red {
        background-color: $red;
        box-shadow: 0 0 0 1px darken($red, $hover);
        &:hover, &.is-active {
          box-shadow: 0 0 0 3px darken($red, $hover+4%);
        }
      }
      &.is-blue {
        background-color: $blue;
        box-shadow: 0 0 0 1px darken($blue, $hover);
        &:hover, &.is-active {
          box-shadow: 0 0 0 3px darken($blue, $hover+4%);
        }
      }
      &.is-green {
        background-color: $green;
        box-shadow: 0 0 0 1px darken($green, $hover);
        &:hover, &.is-active {
          box-shadow: 0 0 0 3px darken($green, $hover+4%);
        }
      }
    }

    .shape {
      height: 24px;
      line-height: 24px;
      margin-bottom: 8px;
      color: $color-font;
      font-weight: 300;
    }

    .actions > .button {
      height: 32px;
      line-height: 30px;
      min-width: 80px;
    }
  }
</style>
