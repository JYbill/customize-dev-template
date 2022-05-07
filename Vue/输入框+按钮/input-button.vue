<template>
  <div class="input-button">
    <el-input class="input" placeholder="请输入内容" @focus="clickInput"></el-input>
    <el-button @click="clickSend">发送</el-button>
  </div>
</template>

<script>
  export default {
    name: "input-button",
    methods: {
      /**
       * 组件事件：点击发送消息input框
       */
      clickInput() {
        this.$emit('notLogin');
      },

      /**
       * 组件事件：点击发送按钮发送消息
       */
      clickSend() {

      },

      /**
       *
       *
       * 封装
       *
       *
       */
      /**
       * 从storage中获取用户信息，用户登陆true，否则false
       * @return Boolean
       */
      getUserByLocalStorage() {

      }
    },
  }
</script>

<style lang="scss" scoped>
  @import "input-button";
</style>