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
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-xiaolian"></use>
        </svg>
      </div>
      <el-input placeholder="请输入消息" v-model="input2">
        <template slot="append">
          <div class="send">发送</div>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script>
// 组件
import chatItem from "components/chat-item/chat-item.vue";

export default {
  name: "chat-box",
  props: {
    // 聊天数据列表
    chatList: {
      type: Array,
      default() {
        return [
          // 测试数据
          {time: 1655435517560, color: 'orange', uid: 'xiaoqinvar', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill1', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill2', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill3', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill4', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill5', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill1', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill2', talk: 'lol...'},
          {time: 1655435517560, color: 'orange', uid: 'jybill3', talk: 'lol...'},
        ]
      }
    },
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

  },

  components: {
    chatItem,
  },
  watch: {
    chatList() {
      this.$nextTick(() => this.$refs["aside"].scrollTop = this.$refs["chat"].scrollHeight);
    }
  },
};
</script>

<style lang="scss" scoped>
@import "chat-box";
</style>