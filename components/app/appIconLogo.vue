<template lang="pug">
  a.logo(v-bind:href="link")
    span.rectangle
    span.circles
      span.circle
      span.circle

</template>

<script>
export default {
  name: 'app-icon-logo',
  props: {
    link: {
      type: String,
      default: ''
    }
  }
}
</script>


<style lang="scss" scoped>
  .logo {
    background: transparent;
    width: 30px;
    height: 30px;
    display: flex;
    span {
      display: block;
    }
    .rectangle {
      width: 15px;
      height: 100%;
      box-sizing: border-box;
      border: 2px solid white;
    }
    .circle{
      width: 15px;
      height: 50%;
      box-sizing: border-box;
      border: 2px solid white;
      border-radius: 100%;
    }
  }
</style>

