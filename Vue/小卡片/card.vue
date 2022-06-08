<template>
  <div class="card">
    <div class="image">
      <img src="~@/assets/images/vcode/login-1.png" alt="">
    </div>
    <div class="info">
      <div class="title-operation">
        <h2>{{name}}</h2>
      </div>
      <div class="time">
        最后直播时间：{{formatDate}}
      </div>
    </div>

    <!--  TODO:是否正在直播  -->
    <span class="isLive"  v-if="true">Live直播中...</span>

    <!-- 操作按钮 -->
    <div class="operation">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-editor"></use>
      </svg>
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-icon"></use>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: "card",
  props: {
    name: {
      type: String,
      require: true
    },
    lastLiveTime: {
      type: [String, Date],
      require: true
    }
  },
  data() {
    return {}
  },
  methods: {},
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
}
</script>

<style lang="scss" scoped>
@import "card.scss";
</style>