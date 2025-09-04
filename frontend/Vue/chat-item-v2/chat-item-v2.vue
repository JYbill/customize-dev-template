<template>
  <div class="chat-item-v2" :class="{ isSelf }">

    <!--  头部  -->
    <div class="header">{{ username[0] }}</div>

    <!--  交谈信息  -->
    <div class="content">
      {{ talk }}
    </div>
  </div>
</template>

<script>
export default {
  name: "chat-item-v2",
  props: {
    isSelf: {
      type: Boolean,
      default: false,
    },
    talk: String,
    username: String,
  }
};
</script>

<style lang="scss" scoped>
@import "./chat-item-v2.scss";
</style>
