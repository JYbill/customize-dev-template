<template>
  <div
      class="room-item"
      @mouseenter="mouseenterRoomItem"
      @mouseleave="mouseleaveRoomItem"
      :style="{width, marginRight}"
  >
    <!-- 封面 -->
    <video v-if="videoUrl" preload="metadata" class="cover"
           poster="@/assets/images/login_bg.png"
           controlslist="nodownload"
           :controls="controlButton"
           :src="videoUrl"
    />
    <div v-else class="cover">{{ isLive ? '' : '转码中...' }}</div>

    <!-- 直播间、录屏信息 -->
    <div class="info">
      <p>{{ name }}</p>
      <div class="time-and-count">
        <span>
          上传时间：{{ formatDateStamp }}
        </span>
        <span v-if="showCount">{{ memberCount }}</span>
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
      isShowIcon: true, // 不展示play-icon
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
      require: false,
      default: 0,
    },
    // 宽度
    width: {
      type: String,
      default: '376px'
    },
    marginRight: {
      type: String,
      default: '20px'
    },
    // 跳转链接
    href: {
      type: String,
      require: false,
    },
    videoUrl: {
      type: String,
      require: false
    },
    controlButton: {
      type: Boolean,
      default: false
    },
    isLive: {
      type: Boolean,
      default: false,
    },

    // 默认显示人数
    showCount: {
      type: Boolean,
      default: true,
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
  computed: {
    formatDateStamp() {
      return new Intl.DateTimeFormat('zh-cn', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      }).format(this.createTime);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./room-item.scss";
</style>