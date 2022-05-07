<template>
  <div class="member-item">
    <!-- 名称 -->
    <p class="header">{{ userStatus.uid }}</p>

    <!-- 摄像头开启状态 -->
    <div v-if="userStatus.hasVideo" class="camera" :id="userStatus.uid"></div>
    <!-- 未开启状态 -->
    <div class="no-video" v-else>
      <div class="name">{{ userStatus.uid }}</div>
    </div>

    <!-- 设备状态 -->
    <div class="deviceStatus">
      <img v-if="userStatus.hasAudio" src="@/assets/images/mic-icon.png" />
      <img v-else src="@/assets/images/slience-mic-icon.png" />
      <img v-if="userStatus.hasVideo" src="@/assets/images/video-icon.png" />
      <img v-else src="@/assets/images/close-video-icon.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: "member-item",
  props: {
    // 用户状态
    userStatus: {
      type: Object,
      required: true,
    },
  }
};
</script>

<style lang="scss" scoped>
@import "./member-item.scss";
</style>