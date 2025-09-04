<template>
  <div class="member-aside" ref="aside">
    <!-- 头部 -->
    <div class="header">
      <slot></slot>
    </div>

    <!-- 成员组件 -->
    <div class="member-continer" v-if="componentType === 'member'">
      <!--   主持人第一位   -->
      <template v-for="item in memberList">
        <member-item v-if="item.isMaster" :userStatus="item" :key="item.uid"
                     :class="{player: currentPlay === item.uid}"
                     @click.native="clickExchangeMember(item.uid)"
        />
      </template>

      <!--   主播   -->
      <template v-for="item in memberList">
        <member-item v-if="!item.isMaster" :userStatus="item" :key="item.uid"
                     :class="{player: currentPlay === item.uid}"
                     @click.native="clickExchangeMember(item.uid)"
        />
      </template>
    </div>
    <!-- 聊天组件 -->
    <div class="chat-continer" ref="chat" v-else>
      <div class="chat" v-for="(item, index) in chatList" :key="index">
        <!-- 时间 -->
        <span class="time" v-if="index === 0">{{
            getFullDate(item.time)
          }}</span>
        <span class="time more-margin" v-else>{{
            getHourMinute(item.time)
          }}</span>

        <!-- 聊天组件 -->
        <chatItem :bg="item.color" :username="item.uid" :talk="item.talk"/>
      </div>
    </div>
  </div>
</template>

<script>
// 组件
import memberItem from "@/components/member-item/member-item.vue";
import chatItem from "@/components/chat-item/chat-item.vue";

export default {
  name: "member-aside",
  props: {
    // member: 渲染成员组件 - chat: 渲染聊天组件
    componentType: {
      type: String,
      default: "member",
    },
    memberList: Object, // 成员列表
    chatList: Array, // 聊天数据列表
    currentPlay: String, // 当前播放者
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
     * 组件事件：切换成员
     */
    clickExchangeMember(uid) {
      this.$emit('clickExchangeMember', uid);
    },
  },

  components: {
    memberItem,
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
@import "./member-aside.scss";
</style>