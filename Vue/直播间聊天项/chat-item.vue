<template>
  <div class="chat-item">
    <!-- 用户logo -->
    <div class="uer-logo" :style="{backgroundColor: bg}">{{ username }}</div>

    <div class="logo-right">
      <div class="username">{{ username }}</div>
      <!-- 聊天内容 -->
      <div class="chat-continer">{{ talk }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "chat-item.scss",
  props: {
    // 背景色
    bg: {
      type: String,
      required: true
    },

    // 用户名
    username: {
      type: String,
      required: true
    },

    // 聊天内容
    talk: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./chat-item.scss";
</style>