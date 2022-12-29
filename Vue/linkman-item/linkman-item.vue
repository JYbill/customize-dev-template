<template>
  <div class="linkman-item">
    <div class="header">{{ username[0] }}</div>
    <div class="name text-overflow-1">{{ username }}</div>
  </div>
</template>

<script>
export default {
  name: "linkman-item",
  props: {
    username: String,
  }
};
</script>

<style lang="scss" scoped>
@import "linkman-item";
</style>
