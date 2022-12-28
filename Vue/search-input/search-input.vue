<template>
  <div class="search-input">
    <el-input
        placeholder="搜索"
        prefix-icon="el-icon-search"
        :value="search"
        @input="inputVal"
    />
    <el-button icon="el-icon-plus"></el-button>
  </div>
</template>

<script>
export default {
  name: "search-input",
  props: {
    search: String,
  },
  methods: {
    inputVal(val) {
      this.$emit("update:search", val);
    },
  }
};
</script>

<style lang="scss" scoped>
@import "./search-input.scss";
</style>
