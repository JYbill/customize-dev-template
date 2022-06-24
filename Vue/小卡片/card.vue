<template>
  <div class="card">
    <div class="image">
      <img :src="image" alt="">
    </div>
    <div class="info">
      <div class="title-operation">
        <h2>{{ name }}</h2>
      </div>
      <div class="time">
        最后直播时间：{{ formatDate }}
      </div>
    </div>

    <span class="isLive" v-if="true">{{ on ? 'Live直播中...' : '' }}</span>

    <!-- 操作按钮 -->
    <div class="operation">
      <svg v-if="updatePermission && showUpdateIcon" class="icon" aria-hidden="true">
        <use xlink:href="#icon-editor"></use>
      </svg>
      <svg v-if="deletePermission" class="icon" aria-hidden="true" @click="clickDelete(id)">
        <use xlink:href="#icon-icon"></use>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: "card",
  props: {
    // id
    id: {
      type: String,
      require: true
    },

    // 频道名
    name: {
      type: String,
      require: true
    },

    // 最后直播的时间
    lastLiveTime: {
      type: [String, Date],
      require: true
    },

    // 频道图片
    image: String,

    // 正在直播
    on: Boolean,

    // 删除权限
    deletePermission: {
      type: Boolean,
      default: true,
    },

    // 更新权限
    updatePermission: {
      type: Boolean,
      default: true,
    },

    // 更新icon
    showUpdateIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {};
  },
  methods: {
    clickDelete(id) {
      this.$emit('clickDelete', id);
    }
  },
  computed: {
    /**
     * 国际化格式化日期时间
     * @return {string}
     */
    formatDate() {
      const date = new Date(this.lastLiveTime);
      const format = new Intl.DateTimeFormat().format(date);
      const res = format.replaceAll('/', '-');
      return res;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "card.scss";
</style>