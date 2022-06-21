<template>
  <div class="input-button">
    <el-input ref="elInputRef" v-model="content" class="input" :placeholder="placeholderContent ? placeholderContent : '请输入内容'" @focus="clickInput" @keyup.native.enter="clickSend"></el-input>
    <el-button @click="clickSend">发送</el-button>
  </div>
</template>

<script>
  export default {
    name: "input-button",
    props: {
      // 提示信息
      placeholderContent: String | null,
    },
    data() {
      return {
        // 评论内容
        content: '',
      }
    },
    methods: {
      /**
       * 组件事件：点击发送消息input框
       */
      clickInput() {
        this.$emit('notLogin');
      },

      /**
       * 组件事件：点击发送按钮发送消息, 并清空内容
       */
      clickSend() {
        if (!this.content || this.content.trim().length <= 0) {
          this.$message.warning("不能发送空内容");
          return;
        }
        this.$emit('sendMessage', this.content);
        this.content = '';
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