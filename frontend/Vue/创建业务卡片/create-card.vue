<template>
  <div class="create-card" :style="{ width, height, backgroundColor }">
    <div class="add">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-xinzeng"></use>
      </svg>
      <p>新建直播频道</p>
    </div>
  </div>
</template>

<script>
  export default {
    name: "create-card",
    data() {
      return {

      }
    },
    props: {
      width: {
        type: String,
      },
      height: {
        type: String,
      },
      backgroundColor: {
        type: String,
        default: '#FFFFFF'
      }
    },
    methods: {},
  }
</script>

<style lang="scss" scoped>
  @import "create-card.scss";
</style>