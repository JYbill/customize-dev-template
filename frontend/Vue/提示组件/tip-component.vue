<template>
  <div class="tip-component">
    <slot>
      <img src="@/assets/images/jinggao1.png" alt="">
      <p>屏幕共享已关闭</p>
    </slot>
  </div>
</template>

<script>
  export default {
    name: "tip-component",
    data() {
      return {

      };
    },
    methods: {},
  };
</script>

<style lang="scss" scoped>
  @import "tip-component.scss";
</style>