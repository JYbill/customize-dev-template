<template>
  <div class="share-component">
    <el-dialog :visible.sync="dialogVisible" :width="width" :top="top" @before-close="beforeCloseDialog">
      <template slot="title">
        <span class="dialog-title">分享</span>
      </template>
      <template>
        <div class="share-body">
          <el-input :value="roomUrl" disabled></el-input>
          <el-button @click="clickCopyURL">复制链接</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "share-component",
    props: {
      // 显示属性
      shareDialogVisible: {
        type: Boolean,
        require: false,
      },

      // 宽度
      width: {
        type: String,
        default: "400px"
      },

      // 高度
      top: {
        type: String,
        default: "40vh"
      },
    },
    data() {
      return {
        roomUrl: '',
        dialogVisible: false,
      }
    },
    methods: {
      /**
       * 组件事件：点击分享按钮
       */
      clickCopyURL() {
        navigator.clipboard.writeText(this.roomUrl);
        this.$emit("update:shareDialogVisible", false);
        this.$message.success("复制房间链接成功");
      },

      /**
       * 组件事件：关闭dialog前回调
       */
      beforeCloseDialog() {
        this.$emit("update:shareDialogVisible", false);
      },
    },
    watch: {
      shareDialogVisible(newVal) {
        if (newVal) {
          this.roomUrl = location.href;
        }
        this.dialogVisible = newVal;
      },
      dialogVisible(newVal) {
        this.$emit("update:shareDialogVisible", newVal);
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "share-component";
</style>