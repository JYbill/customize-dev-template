<template>
  <div class="chat-block">
    <span class="username">{{ uid }}:</span>
    <span class="comment">{{ comment }}</span>
  </div>
</template>

<script>
export default {
  name: "chat-block",
  props: {
    // 用户id
    uid: {
      type: String,
      require: true
    },

    // 评论内容
    comment: {
      type: String,
      require: true,
    },
  }
}
</script>

<style lang="scss" scoped>
  @import "chat-block.scss";
</style>