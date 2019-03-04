<template lang="pug">
  div
    app-icons-menu
    .error-page
      .container

        .row(v-if="error.statusCode === 404")
          .column
            img.not-found-pic(src="/vue-static/icon/error.png" alt="nothing found")
            h1 {{ error.message }}

        .row(v-else)
          .column
            img.not-found-pic(src="/vue-static/icon/error.png" alt="nothing found")
            h1 {{$t('WEB_APP.MESSAGES.ERROR_TITLE')}}
            h3(v-html="$t('WEB_APP.MESSAGES.ERROR_DESCRIPTION_2')")
            br
            h4 {{ error.statusCode }}
              br
              | {{ error.message }}
              br
              small {{ error.text }}
              br
              small {{ error.stack }}

        .row(v-if="error.statusCode === 404")
          .column
            .error-info Please&nbsp;
              a(@click="$router.go(-1)") go back&nbsp;
              | or start over from&nbsp;
              a(href="https://icons8.com") Home&nbsp;
              | page

</template>

<script>
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="80" height="80">
  <g>
    <path style=" fill:#FFCA28;" d="M 43 24 C 43 34.492188 34.492188 43 24 43 C 13.507813 43 5 34.492188 5 24 C 5 13.507813 13.507813 5 24 5 C 34.492188 5 43 13.507813 43 24 Z "></path>
    <path style=" fill:#FFFFFF;" d="M 16 29 C 13.242188 29 11 26.757813 11 24 C 11 21.242188 13.242188 19 16 19 C 18.757813 19 21 21.242188 21 24 C 21 26.757813 18.757813 29 16 29 Z "></path>
    <path style=" fill:#3F51B5;" d="M 16 20 C 18.207031 20 20 21.789063 20 24 C 20 26.210938 18.207031 28 16 28 C 13.789063 28 12 26.210938 12 24 C 12 21.789063 13.789063 20 16 20 M 16 18 C 12.691406 18 10 20.691406 10 24 C 10 27.308594 12.691406 30 16 30 C 19.308594 30 22 27.308594 22 24 C 22 20.691406 19.308594 18 16 18 Z "></path>
    <path style=" fill:#1976D2;" d="M 18 25.5 C 18 26.328125 17.328125 27 16.5 27 C 15.671875 27 15 26.328125 15 25.5 C 15 24.671875 15.671875 24 16.5 24 C 17.328125 24 18 24.671875 18 25.5 Z "></path>
    <path style=" fill:#FFFFFF;" d="M 32 29 C 29.242188 29 27 26.757813 27 24 C 27 21.242188 29.242188 19 32 19 C 34.757813 19 37 21.242188 37 24 C 37 26.757813 34.757813 29 32 29 Z "></path>
    <path style=" fill:#3F51B5;" d="M 32 20 C 34.207031 20 36 21.789063 36 24 C 36 26.210938 34.207031 28 32 28 C 29.789063 28 28 26.210938 28 24 C 28 21.789063 29.789063 20 32 20 M 32 18 C 28.691406 18 26 20.691406 26 24 C 26 27.308594 28.691406 30 32 30 C 35.308594 30 38 27.308594 38 24 C 38 20.691406 35.308594 18 32 18 Z "></path>
    <path style=" fill:#1976D2;" d="M 33 25.5 C 33 26.328125 32.328125 27 31.5 27 C 30.671875 27 30 26.328125 30 25.5 C 30 24.671875 30.671875 24 31.5 24 C 32.328125 24 33 24.671875 33 25.5 Z "></path>
    <path style="fill:none;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke:#3F51B5;stroke-opacity:1;stroke-miterlimit:4;" d="M 21 25 C 21 25 22 23 24 23 C 26 23 27 25 27 25 "></path>
    <path style="fill:none;stroke-width:2;stroke-linecap:butt;stroke-linejoin:miter;stroke:#B76C09;stroke-opacity:1;stroke-miterlimit:4;" d="M 28 36 C 28 33.789063 26.210938 32 24 32 C 21.789063 32 20 33.789063 20 36 "></path>
  </g>
</svg>`
export default {
  name: 'NuxtError',
  props: ['error'],
  data () {
    return {
      svg
    }
  },
  head () {
    return {
      title: this.error.message || 'An error occured'
    }
  },
  methods: {
    goBack () {
      //
    }
  }
}
</script>

<style lang="scss" scoped>

  .error-page {
    background: #fff;
    word-spacing: 1px;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-align: center;
    position: absolute;
    width: 100%;
    top: 57px;
    z-index: 0;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    h1 {
      font-size: 32px;
      margin-bottom: 0;
    }

    .not-found-pic {
      margin: 0 auto;
    }

    .error-info {
      font-size: 16px;
      font-weight: bold;
      color: #4C4C4C;
    }

    .container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      height: 95vh;
      margin: 0 auto;
      max-width: 90%;

    }
    .powered {
      text-align: center;
      margin-top: 10%;
    }
    a {
      color: #49A3FF !important;
    }
    pre {
      border-color: #42b983 !important;
    }
  }
</style>
