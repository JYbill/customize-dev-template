<template>
  <div class="setting-header">

    <!-- 选择框  -->
    <el-select v-model="currentData" placeholder="请选择" size="medium" @change="(value) => { $emit('selected', value); }">
      <template v-slot:prefix>
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-wenjianjia"></use>
        </svg>
      </template>
      <el-option
          v-for="item in dataList"
          :key="item._id"
          :label="item.name"
          :value="item._id">
      </el-option>
    </el-select>

    <!--  观看地址分享按钮  -->
    <el-popover
        placement="bottom"
        title="观看地址"
        width="300"
        trigger="click"
        content="这是一段内容,这是一段内容,这是一段内容,这是一段内容。">
      <template>
        <!--   复制地址     -->
        <div class="share-body">
          <el-input :value="url" disabled></el-input>
          <el-button @click="clickCopyURL">复制</el-button>
        </div>
        <div class="qrcode">
          <span>手机观看</span>
          <img :src="qrCode" alt="">
        </div>
      </template>
      <!--  分享按钮    -->
      <template v-slot:reference>
        <el-button class="share" slot="reference" icon="el-icon-share" :plain="true">观看地址</el-button>
        <!--    返回频道页    -->
        <el-button @click="$emit('goToIndex')">返回频道首页</el-button>
        <!--    返回海报页面    -->
        <el-button @click="$emit('goToPoster')">海报页面</el-button>
      </template>
    </el-popover>

    <div class="button-group" v-if="hasUpdatePermission">
      <el-button icon="el-icon-video-play" class="living" @click="clickLive">开启直播</el-button>
      <el-button class="channel-operation" @click="clickChannel" :class="{active: active === true}">频道管理</el-button>
      <el-button class="history-playback" @click="clickPlayback" :class="{active: active === false}">历史直播</el-button>
    </div>
    <div class="no-permission" v-else>
      <el-button icon="el-icon-video-play" class="living" @click="clickLive">进入直播</el-button>
      <el-button class="history-playback" @click="clickPlayback" :class="{active: active === false}">历史直播</el-button>
    </div>
  </div>
</template>

<script>
// 库
import jrQrcode from "jr-qrcode";

export default {
  name: "setting-header",
  data() {
    return {
      url: '',
      // 二维码base64
      qrCode: '',
      currentData: null,
      // null - 都不选中，true - 频道管理，false - 历史直播
      active: null,
    };
  },
  props: {
    // select 数据
    dataList: {
      type: Array,
      default() {
        return [];
      }
    },

    // 直播路径
    livePath: {
      type: String,
      default() {
        return '';
      }
    },

    // 更新权限
    hasUpdatePermission: {
      type: Boolean,
      default: true,
    },

  },
  methods: {
    clickChannel() {
      this.active = true;
      this.$emit('clickChannel');
    },
    clickPlayback() {
      this.active = false;
      this.$emit('clickPlayback');
    },
    /**
     * 组件事件：点击分享按钮
     */
    clickCopyURL() {
      navigator.clipboard.writeText(this.getShareUrl);
      this.$message.success('复制成功');
    },

    // 点击开始直播
    clickLive() {
      this.$emit('live');
    }
  },
  computed: {
    getShareUrl() {
      return this.livePath.replace('screen-room', 'screen-visitor');
    }
  },
  created() {
    // url生成二维码
    this.url = this.getShareUrl;
    this.qrCode = jrQrcode.getQrBase64(this.url);

    //init data
    const timer = setInterval(() => {
      if (this.dataList.length >= 1) {
        this.currentData = this.$route.params.id;
        clearInterval(timer);
      }
    }, 200);
  },
};
</script>

<style lang="scss" scoped>
@import "setting-header.scss";
</style>