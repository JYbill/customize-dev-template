<template>
  <div
    class="room-item"
    @mouseenter="mouseenterRoomItem"
    @mouseleave="mouseleaveRoomItem"
    :style="{width, marginRight}"
  >
    <!-- 封面 -->
    <div class="cover"></div>

    <!-- 直播间、录屏信息 -->
    <div class="info">
      <p>{{ name }}</p>
      <div class="time-and-count">
        <span>{{ createTime }}</span>
        <span>{{ memberCount }}</span>
      </div>
    </div>

    <!-- 占位播放按钮 -->
    <div
      class="play"
      :class="{ showIcon: isShowIcon, dontShowIcon: !isShowIcon }"
    ></div>
  </div>
</template>

<script>
export default {
  name: "room-item",
  data() {
    return {
      isShowIcon: false, // 不展示play-icon
    };
  },
  props: {
    // 直播间名
    name: {
      type: String,
      require: true,
    },
    // 直播间创建时间戳
    createTime: {
      type: Number,
      require: true,
    },
    // 直播间观看人数
    memberCount: {
      type: Number,
      require: true,
    },
    // 宽度
    width: {
      type: String,
      default: '376px'
    },
    marginRight: {
      type: String,
      default: '20px'
    }
  },
  methods: {
    // 鼠标进入组件事件
    mouseenterRoomItem() {
      this.isShowIcon = true;
    },

    // 鼠标离开组件事件
    mouseleaveRoomItem() {
      this.isShowIcon = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./room-item.scss";
</style>