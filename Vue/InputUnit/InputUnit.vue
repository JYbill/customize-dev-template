<template>
    <div class="InputUnit">
        <el-input
                :value="value"
                :placeholder="placeholder"
                @input="(value) => $emit('input', value)" />
        <div class="unit">{{ unit }}</div>
    </div>
</template>

<script>
export default {
  name: "InputUnit",
  props: {
    value: String,
    placeholder: String,
    unit: String,
  },
};
</script>

<style scoped lang="scss">
@import "InputUnit";
</style>
