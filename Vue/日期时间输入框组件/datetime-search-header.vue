<template>
  <div class="datetime-search-header">
    <el-button @click="clickDownVideo">下载视频</el-button>
    <el-button @click="clickDeleteVideo">删除视频</el-button>
    <div class="empty"></div>
    <el-date-picker
        v-model="date"
        type="daterange"
        align="right"
        :unlink-panels="true"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        @blur="blurDatePicker" />
    <div class="search">
      <el-input
          style="border-radius: 18px"
          :value.sync="searchValue"
          @input="(value) => { $emit('update:searchValue', value) }"
          placeholder="搜索直播"
          @keyup.enter.native="searchHandler"/>
      <el-button @click="searchHandler">搜索</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "datetime-search-header",
  data() {
    return {
      // 日期选择组件固定数据
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
      },
      // 日期数据
      date: '',
    };
  },
  props: {
    // 搜索内容
    searchValue: String,
  },
  methods: {

    // 下载视频
    clickDownVideo() {
      this.$emit('download');
    },

    // 删除视频
    clickDeleteVideo() {
      this.$emit('delete');
    },

    // 搜索事件
    searchHandler() {
      this.$emit('search', this.searchValue);
    },

    // 日期选择器失去焦点触发
    blurDatePicker() {
      this.$emit('blurDate', this.date);
    }
  },
};
</script>

<style lang="scss" scoped>
@import "datetime-search-header.scss";
</style>