<template>
  <div class="conversation-item">
    <!--  左侧header  -->
    <div class="header">{{ username[0] }}</div>

    <!--  消息内容  -->
    <div class="content">
      <div class="top text-overflow-1">{{ username }}</div>
      <div class="bottom text-overflow-1">{{ lastMessage }}</div>
    </div>

    <!--  时间  -->
    <div class="last-time">{{ lastTime | formatDate }}</div>

    <!--  未读消息数  -->
    <div class="notice" v-show="noticeNum >= 1"></div>
  </div>
</template>

<script>
export default {
  name: "conversation-item",
  props: {
    username: String,
    lastMessage: String,
    lastTime: [Date, String],
    noticeNum: Number, // 未读消息数
  },
  filters: {
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();

      // 时 : 分
      let hour = date.getHours();
      hour = hour >= 10 ? hour : "0" + hour;
      let second = date.getSeconds();
      second = second >= 10 ? second : "0" + second;
      let hourSecond = hour + ":" + second;

      // 今天
      if (now.getDate() === date.getDate()) {
        return hourSecond;
      }
      // 之前
      return (date.getMonth() + 1) + "/" + date.getDate() + " " + hourSecond;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./conversation-item.scss";
</style>
