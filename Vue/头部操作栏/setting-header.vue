<template>
  <div class="setting-header">

    <!-- 选择框  -->

    <el-select v-model="currentData" placeholder="请选择" size="medium">
      <el-option
          v-for="item in dataList"
          :key="item.id"
          :label="item.label"
          :value="item.id">
      </el-option>
    </el-select>

    <!--  观看地址分享按钮  -->
    <el-button icon="el-icon-share" :plain="true">观看地址</el-button>

    <div class="button-group">
      <el-button icon="el-icon-video-play" class="living">开启直播</el-button>
      <el-button class="channel-operation" @click="clickChannel" :class="{active: active}">频道管理</el-button>
      <el-button class="history-playback" @click="clickPlayback" :class="{active: !active}">历史直播</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "setting-header",
  data() {
    return {
      currentData: null,
      // true - 频道管理，false - 历史直播
      active: true,
    }
  },
  props: {
    dataList: {
      type: Array,
      default() {
        return [{id: 1, label: '1'}, {id: 1, label: '1'}, {id: 2, label: '2'}];
      }
    }
  },
  methods: {
    clickChannel() {
      this.active = true;
    },
    clickPlayback() {
      this.active = false;
    }
  },
}
</script>

<style lang="scss" scoped>
@import "setting-header.scss";
</style>