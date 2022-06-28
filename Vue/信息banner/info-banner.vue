<template>
  <div class="info-banner">
    <!--  头部图片  -->
    <div class="header-img">
      <img :src="img" alt="">
    </div>

    <!--  信息  -->
    <div class="info">
      <p>{{ title }}</p>
      <div class="share" @click="$emit('share')">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-fenxiang"></use>
        </svg>
        <span>分享</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "info-banner",
  data() {
    return {};
  },
  props: {
    // 标题
    title: String,
    // 图片
    img: String,
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import "info-banner.scss";
</style>