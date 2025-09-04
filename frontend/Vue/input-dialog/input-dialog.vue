<template>
  <el-dialog
      class="input-dialog"
      :visible.sync="visible"
      :modal="true"
      :close-on-click-modal="false"
      width="500px"
      :show-close="false"
      :before-close="closeHandler">
    <template v-slot:title>
      <div class="header">
        <div class="title">{{ title }}</div>
        <img @click.stop="closeHandler" src="./images/close@2x.png" alt="">
      </div>
    </template>
    <div class="content">
      <el-input
          :placeholder="placeholder"
          class="input"
          type="text"
          v-model="input"
          @blur="$emit('update:inputValue', input)"/>
      <button class="submit" @click.stop="submitHandler">确认</button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "input-dialog",
  props: {
    visible: {
      type: Boolean,
      default: true,
    },
    title: String,
    placeholder: String,
    inputValue: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      input: "",
    };
  },
  methods: {
    /**
     * 确定处理器
     */
    submitHandler() {
      if (this.input === "") {
        this.$notify.warning(`请输入${this.title}内容`);
        return;
      }
      this.input = "";
      this.$emit('submit');
      this.$emit("update:visible", false);
    },

    /**
     * 关闭处理器
     */
    closeHandler() {
      this.input = "";
      this.$emit("update:inputValue", "");
      this.$emit("update:visible", false);
    },
  },

  watch: {
    visible(show) {
      if (!show) return;
      this.input = this.inputValue;
    }
  }
};
</script>

<style scoped lang="scss">
@import "input-dialog";
</style>
