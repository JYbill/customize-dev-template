<template>
  <div class="conversation-container">
    <div class="chat-header">
      <span class="name text-overflow-1">{{ userInfo.name }}</span>
      <span class="desc">{{ userInfo.titlesDes }}</span>
    </div>
    <div class="content" ref="chatContainerRef" @scroll="scrollContainer">
      <template v-for="msg in msgList">
        <chatItem :key="msg._id"
                  :talk="msg.content"
                  :username="msg.from_id.name"
                  :is-self="self.user_id === msg.from_id._id"/>
      </template>
    </div>

    <div class="input">
      <el-input
          ref="inputRef"
          type="textarea"
          :rows="5"
          resize="none"
          :placeholder="`按回车键发送消息给 ${userInfo.name}`"
          :value="messageVal"
          @input="inputEvent"
          @keyup.enter.native="enterMsg"
      />
      <!--    emoji表情栏    -->
      <VEmojiPicker
          ref="emojiRef"
          v-show="showEmoji"
          @click.native.stop="closeEmoji"
          @select="selectEmoji"/>
      <svg class="icon"
           aria-hidden="true"
           @click.stop="openEmoji">
        <use xlink:href="#icon-xiaolian"></use>
      </svg>
    </div>
  </div>
</template>

<script>
import {VEmojiPicker} from "v-emoji-picker";
import chatItem from "components/chat-item-v2/chat-item-v2.vue";
import chatApi from "api/chat/chat.api";

export default {
  name: "conversation-container",
  data() {
    return {
      showEmoji: false,
    };
  },
  props: {
    messageVal: String,
    userInfo: Object,
    conversation: Object, // 当前加入的会话信息
    msgList: Array,
    self: Object,
  },
  methods: {
    inputEvent(val) {
      this.$emit("input", val);
    },
    enterMsg() {
      let msg = this.messageVal;
      if (msg.endsWith("\n")) {
        msg = msg.replace("\n", "");
      }
      this.$emit("enter", msg);
    },

    /**
     * 选择emoji表情
     */
    selectEmoji(emojiData) {
      const emoji = emojiData.data;
      const inputRef = this.$refs["inputRef"];
      inputRef.focus();
      this.$emit("input", this.messageVal + emoji);
    },

    /**
     * 打开emoji选择板
     */
    openEmoji() {
      this.showEmoji = !this.showEmoji;
    },

    /**
     * 关闭emoji选择板
     */
    closeEmoji() {
      this.showEmoji = false;
    },

    scrollContainer(e) {
      const el = e.target;
      if (el.scrollTop >= 1) {
        return;
      }

      // 滚动到顶，请求加载更多历史信息
      const conversation = this.conversation;
      const latestMsgCreatTime = conversation.msg[0].createdAt;
      const cid = conversation._id;
      this.getHistoryMsgHTTP(cid, latestMsgCreatTime);
    },

    /**
     * 将聊天内容Ref元素滚动到底部
     */
    scroll2Bottom() {
      this.$nextTick(() => {
        const chatContainerRef = this.$refs["chatContainerRef"];
        chatContainerRef.scrollTop = chatContainerRef.scrollHeight;
      });
    },

    /**
     * 获取历史消息记录
     * @return {Promise<void>}
     */
    async getHistoryMsgHTTP(cid, createTime) {
      const res = await chatApi.getHistoryMsg({cid, createTime});
      if (res.code !== 1) {
        return console.error("getHistoryMsgHTTP#获取历史消息失败", res);
      }
      const msgList = res.data;
      this.$emit("update:msgList", [...msgList, ...this.msgList]);

      // 无最新消息
      if (msgList.length <= 0) {
        this.$message.info("没有更多历史消息了");
        return;
      }

      // 只要获取到历史记录，即发生滚动
      this.$nextTick(() => {
        let midElLength = msgList.length;
        const chatContainerRef = this.$refs["chatContainerRef"];
        const historyMidEl = chatContainerRef.children[midElLength];

        // 获取最新元素的margin高度
        let marginHeightNum = document.defaultView.getComputedStyle(historyMidEl, null)['marginTop'];
        marginHeightNum = marginHeightNum.replace("px", "");
        marginHeightNum = parseInt(marginHeightNum);

        // 发生动态滚动
        chatContainerRef.scroll({
          top: historyMidEl.offsetTop - historyMidEl.offsetHeight - marginHeightNum,
          behavior: "smooth",
        });
      });
    },
  },
  components: {
    chatItem,
    VEmojiPicker,
  }
};
</script>

<style lang="scss" scoped>
@import "./chat-container.scss";
</style>
