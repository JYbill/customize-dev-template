<template>
  <div class="chat-box" ref="aside">
    <!-- 头部 -->
    <div class="header">
      <slot></slot>
    </div>

    <!-- 聊天组件 -->
    <div class="chat-continer" ref="chat">
      <div class="chat" v-for="(item, index) in chatList" :key="index">
        <!-- 时间 -->
        <span class="time" v-if="index === 0">{{ getFullDate(item.time) }}</span>
        <span class="time more-margin" v-else>{{ getHourMinute(item.time) }}</span>

        <!-- 聊天组件 -->
        <chatItem :bg="item.color" :username="item.uid" :talk="item.talk"/>
      </div>
    </div>

    <!--  聊天框  -->
    <div class="chat-input">
      <div class="emoji">

        <!--    emoji表情栏    -->
        <VEmojiPicker
            ref="emojiRef"
            v-show="showEmoji"
            @click.native.stop=""
            @select="selectEmoji" />
        <svg class="icon"
             aria-hidden="true"
             @click.stop="openEmoji">
          <use xlink:href="#icon-xiaolian"></use>
        </svg>
      </div>
      <el-input :placeholder="disabled ? '请先登录' : '请输入消息'"
                :value.sync="message"
                :disabled="disabled"
                @click.native.stop=""
                @click.native="clickInput"
                @keyup.native.enter="clickInput"
                @input="(value) => $emit('update:message', value)">
        <template slot="append">
          <div class="send" :class="{disabled: disabled}" @click="send">发送</div>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script>
// 组件
import {VEmojiPicker} from 'v-emoji-picker';
import chatItem from "components/chat-item/chat-item.vue";

export default {
  name: "chat-box",
  data() {
    return {
    };
  },
  props: {
    // 禁用输入框
    disabled: Boolean,
    // 聊天数据列表
    chatList: {
      type: Array,
      default() {
        return [];
      }
    },

    // 消息
    message: String,

    // 展示emoji选择板
    showEmoji: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    /**
     * 根据时间戳获取完整日期 yyyy-mm-dd hh:MM:ss
     */
    getFullDate(timeStamp) {
      const dateTime = new Date(timeStamp);
      const year = dateTime.getFullYear();
      const month = dateTime.getMonth();
      const day = dateTime.getDate();
      return `${year}.${month + 1}.${day} ` + this.getHourMinute(timeStamp);
    },

    /**
     * 根据时间戳获取 hh:MM:ss
     */
    getHourMinute(timeStamp) {
      return new Date(timeStamp).toLocaleTimeString();
    },

    /**
     * 未登录状态下点击input会触发toLogin事件
     */
    clickInput(key) {
      if (!this.disabled) {
        if (key.keyCode === 13) {
          this.send();
        }
        return;
      }
      this.$emit('toLogin');
    },

    /**
     * 登陆状态下发送消息事件
     */
    send() {
      if (this.disabled) {
        return;
      }
      this.$emit('sendMessage', this.message);
      this.$emit('update:showEmoji', false);
    },

    /**
     * 打开emoji
     */
    openEmoji() {
      if (this.disabled) {
        this.$emit('toLogin');
        return;
      }
      this.$emit('update:showEmoji', !this.showEmoji);
    },

    /**
     * 选择emoji表情
     */
    selectEmoji(emoji) {
      if (this.disabled) {
        return;
      }

      const data = emoji.data;
      this.$emit('update:message', this.message + data);
    },
  },

  components: {
    chatItem,
    VEmojiPicker
  },
  watch: {
    chatList() {
      this.$nextTick(() => {
        this.$refs["chat"].scrollTop = this.$refs["chat"].scrollHeight;
      });
    }
  },
  mounted() {
    // 初始化表情选项
    // const emojiRef = this.$refs['emojiRef'].$children[1];
  },
};
</script>

<style lang="scss" scoped>
@import "chat-box";
</style>