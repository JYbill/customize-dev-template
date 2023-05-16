<template>
    <div class="card1" :style="{ width }">
        <div class="left">
            <div class="title">{{ title }}</div>
            <div class="desc">{{ desc }}</div>
            <div class="operation">
                <slot name="btn1">
                    <span class="btn" @click.stop="$emit('click1')">{{ btn1Text }}</span>
                </slot>
                <span v-if="haveBtn2" @click.stop="$emit('click2')" class="btn">{{ btn2Text }}</span>
            </div>
        </div>
        <div class="right">
            <img :src="img" alt="">
        </div>
    </div>
</template>

<script>
export default {
  name: "card1",
  props: {
    width: {
      type: String,
      default: "32%",
    },
    title: {
      type: String,
      default: "基本信息",
    },
    desc: {
      type: String,
      default: "填写基本信息"
    },
    btn1Text: {
      type: String,
      default: "去填写",
    },
    img: String | Object,
    haveBtn2: {
      type: Boolean,
      default: false,
    },
    btn2Text: {
      type: String,
      default: "查看",
    },
  },
};
</script>

<style scoped lang="scss">
@import "card1";
</style>
