<template>
  <div class="input-button">
    <VEmojiPicker
        v-show="showEmoji"
        @select="selectEmoji"
        @click.native.stop=""/>
    <svg class="icon" aria-hidden="true" @click.stop="openEmoji">
      <use xlink:href="#icon-xiaolian"></use>
    </svg>
    <el-input ref="elInputRef"
              v-model="content"
              class="input"
              :placeholder="placeholderContent ? placeholderContent : '请输入内容'"
              @focus="clickInput"
              @keyup.native.enter="clickSend"
              @click.native.stop=""
    ></el-input>
    <el-button @click="clickSend">发送</el-button>
  </div>
</template>

<script>
import {VEmojiPicker} from 'v-emoji-picker';
  export default {
    name: "input-button",
    props: {
      // 提示信息
      placeholderContent: {
        type: String,
        default: null
      },

      // 是否登陆
      isLogin: {
        type: Boolean,
        default: false,
      },

      // 展示emoji选择板
      showEmoji: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        // 评论内容
        content: '',
      };
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
        this.$emit('sendMessage', this.content);
        this.$emit('update:showEmoji', false);
        this.content = '';
      },

      /**
       * 打开emoji板块
       */
      openEmoji() {
        if (!this.isLogin) {
          this.$emit('notLogin');
          return;
        }
        this.$emit('update:showEmoji', !this.showEmoji);
      },

      /**
       * 选择emoji表情
       */
      selectEmoji(emoji) {
        if (!this.isLogin) {
          this.$emit('notLogin');
          return;
        }
        const data = emoji.data;
        this.content += data;
      },
    },
    components: {
      VEmojiPicker
    }
  };
</script>

<style lang="scss" scoped>
  @import "input-button";
</style>