<template>
  <div class="info-banner">
    <!--  头部图片  -->
    <div class="header-img">
      <img :src="img" alt="">
    </div>

    <!--  信息  -->
    <div class="info" slot="reference" ref="infoRef">
      <p>{{ title }}</p>
      <div slot="reference" class="share">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-fenxiang"></use>
        </svg>
        <span>分享</span>
      </div>

      <!--   hover出现的分享组件   -->
      <div v-show="showShare" class="share-content" @mouseenter="enter" @mouseleave="leave">
        <img :src="qrCodeBase64" width="30%" alt="">
        <el-button @click="downloadImg">
          <a :href="qrCodeBase64" download="二维码.png">保存二维码</a>
          </el-button>
        <div class="share-input">
          <el-input :value="url" disabled />
          <el-button @click="clickCopyURL">复制链接</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jrQrcode from "jr-qrcode";

export default {
  name: "info-banner",
  data() {
    return {
      url: location.href,
    };
  },
  computed: {
    qrCodeBase64() {
      return jrQrcode.getQrBase64(this.url);
    }
  },
  props: {
    // 标题
    title: String,
    // 图片
    img: String,
    // 显示分享组件
    showShare: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    /**
     * 复制input url
     */
    clickCopyURL() {
      navigator.clipboard.writeText(this.url);
      this.$message.success("复制房间链接成功");
    },

    /**
     * 下载图片
     */
    downloadImg() {
      // const download = document.createElement('a');
      // download.setAttribute('download', "二维码");
      // download.clik();
    },
    /**
     * 进入分享内容
     */
    enter() {
      this.$emit('update:showShare', true);
    },

    /**
     * 离开分享内容
     */
    leave() {
      this.$emit('update:showShare', false);
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
@import "info-banner.scss";
</style>
