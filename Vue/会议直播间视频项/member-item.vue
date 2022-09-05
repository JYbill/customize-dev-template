<template>
  <div class="member-item">
    <!-- 名称 -->
    <p class="header">
      <span>{{ showName }}</span>
    </p>

    <!-- 摄像头开启状态 -->
    <div v-show="userStatus && userStatus.hasVideo"
         class="camera"
         :id="userStatus && userStatus.uid"></div>

    <!-- 未开启状态 -->
    <div class="no-video" v-show="userStatus && !userStatus.hasVideo">
      <div class="name">{{ userStatus.name && userStatus.name.substring(0, 1) }}</div>
    </div>

    <!-- 设备状态 -->
    <div class="deviceStatus">
      <template v-if="userStatus && userStatus.hasAudio">
        <img alt="" src="@/assets/images/mic-icon.png"/>
        <el-progress
            v-if="showVolume"
            :show-text="false"
            :percentage="userStatus && userStatus.volume > 100 ? 100 : userStatus.volume"
            :stroke-width="7"
        />
      </template>
      <img alt="" v-else src="@/assets/images/slience-mic-icon.png"/>
      <img alt="" v-if="userStatus && userStatus.hasVideo" src="@/assets/images/video-icon.png"/>
      <img alt="" v-else src="@/assets/images/close-video-icon.png"/>
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

    // 管理员 _id
    manager: {
      type: String,
      required: false,
    },

    /**
     * 展示音量组件
     */
    showVolume: {
      type: Boolean,
      default: true
    }
  },

  watch: {
    // 将进度条修改为线性渐变色
    "userStatus.volume"(volume) {
      const elProgressInnerEl = document.querySelector('.deviceStatus .el-progress-bar__inner');
      this.$nextTick(() => {
        // 可能关闭声音中
        if (!elProgressInnerEl) {
          return;
        }
        // console.log(elProgressInnerEl);
        if (volume <= 25) {
          elProgressInnerEl.style.background = 'green';
        } else if (volume <= 50) {
          elProgressInnerEl.style.background = 'linear-gradient(to right, green, yellow)';
        } else if (volume <= 75) {
          elProgressInnerEl.style.background = 'linear-gradient(to right, green, yellow, orange)';
        } else {
          elProgressInnerEl.style.background = 'linear-gradient(to right, green, yellow, orange, red)';
        }
      });
    }
  },
  computed: {
    /**
     * 显示当前主播 or 管理员名
     */
    showName() {
      if (!this.userStatus || !this.manager) {
        return '';
      }
      const username = this.userStatus.uid;
      const managerName = this.manager;
      return `${this.userStatus.name}(${managerName === username ? '管理员' : '主播'})`;
    },
  }
};
</script>

<style lang="scss" scoped>
@import "./member-item.scss";
</style>